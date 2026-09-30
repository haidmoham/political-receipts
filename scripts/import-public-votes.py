"""Rebuild the bounded official vote windows from preserved XML (Python 3 stdlib)."""
import hashlib,json,xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
root=Path(__file__).resolve().parent.parent
roster={p['id']:p for p in json.loads((root/'data/politicians.json').read_text(encoding='utf-8'))['politicians']}
legislators=json.loads((root/'data/legislators-current.json').read_text(encoding='utf-8'))
lis={}
for legislator in legislators:
 identity=legislator['id'].get('bioguide');member=roster.get(identity);key=legislator['id'].get('lis')
 if member and member['chamber']=='Senate' and key:
  if key in lis:raise ValueError('Ambiguous LIS identity')
  lis[key]=member
records=json.loads((root/'data/public-records.json').read_text(encoding='utf-8'))
rolls=[]
for chamber,numbers in [('House',range(190,202)),('Senate',range(372,384))]:
 for number in numbers:
  path=root/f'data/evidence/{chamber.lower()}-roll{number}-2025.xml';raw=path.read_bytes();doc=ET.fromstring(raw);votes={};excluded=[]
  if chamber=='House':
   meta=doc.find('vote-metadata')
   if meta.findtext('congress')!='119' or meta.findtext('rollcall-num')!=str(number):raise ValueError('Unexpected House source')
   date=datetime.strptime(meta.findtext('action-date'),'%d-%b-%Y').date().isoformat()
   bill=meta.findtext('legis-num');title=meta.findtext('vote-desc');question=meta.findtext('vote-question');result=meta.findtext('vote-result')
   for row in doc.findall('.//recorded-vote'):
    leg=row.find('legislator');identity=leg.get('name-id');member=roster.get(identity)
    if member and member['chamber']=='House' and member['state']==leg.get('state'):
     if identity in votes:raise ValueError('Duplicate House identity')
     votes[identity]=row.findtext('vote')
    else:excluded.append(identity)
   source_count=len(doc.findall('.//recorded-vote'));url=f'https://clerk.house.gov/evs/2025/roll{number}.xml';join='Exact Bioguide ID, House chamber and state.'
   context=None
  else:
   if doc.findtext('congress')!='119' or doc.findtext('session')!='1' or doc.findtext('vote_number')!=str(number):raise ValueError('Unexpected Senate source')
   date=datetime.strptime(doc.findtext('vote_date').split(',  ')[0],'%B %d, %Y').date().isoformat()
   bill=doc.findtext('document/document_name') or doc.findtext('vote_title');title=doc.findtext('vote_document_text');question=doc.findtext('question');result=doc.findtext('vote_result_text') or doc.findtext('vote_result');context=doc.findtext('vote_title')
   for row in doc.findall('members/member'):
    key=row.findtext('lis_member_id');member=lis.get(key)
    if member and member['state']==row.findtext('state'):
     if member['id'] in votes:raise ValueError('Duplicate Senate identity')
     votes[member['id']]=row.findtext('vote_cast')
    else:excluded.append(key)
   source_count=len(doc.findall('members/member'));url=f'https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_{number:05}.htm';join='Exact Senate LIS ID mapped to Bioguide through the bundled roster, Senate chamber and state.'
  allowed={'Aye','No','Yea','Nay','Present','Not Voting'} if chamber=='House' else {'Yea','Nay','Present','Not Voting'}
  if not set(votes.values())<=allowed:raise ValueError('Unexpected vote status')
  minimum_matches=90 if chamber=='Senate' else 400
  if len(votes)<minimum_matches:raise ValueError('Insufficient matches')
  rolls.append(dict(id=f'{chamber.lower()}:119:1:{number}',congress=119,session=1,chamber=chamber,number=number,date=date,bill=bill,title=title,question=question,context=context,result=result,url=url,sourcePath=str(path.relative_to(root)).replace('\\','/'),sha256=hashlib.sha256(raw).hexdigest(),identityJoin=join,sourceMembers=source_count,matchedMembers=len(votes),excludedSourceIds=excluded,votes=votes))
records['schemaVersion']=2;records.pop('rollCall',None);records['rollCalls']=rolls
covered=set().union(*(set(r['votes']) for r in rolls))
records['coverage']['votes']={'description':'Consecutive selected roll-call windows, not a complete voting history. Selection is by roll number, not vote outcome or member.','House':{'firstRoll':190,'lastRoll':201,'count':12,'start':'2025-07-03','end':'2025-07-17'},'Senate':{'firstRoll':372,'lastRoll':383,'count':12,'start':'2025-07-01','end':'2025-07-10'},'members':len(covered),'identityMapSource':'data/legislators-current.json','identityMapSha256':hashlib.sha256((root/'data/legislators-current.json').read_bytes()).hexdigest()}
(root/'data/public-records.json').write_text(json.dumps(records,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({'rolls':len(rolls),'members':len(covered),'HouseMatches':sorted(set(r['matchedMembers'] for r in rolls if r['chamber']=='House')),'SenateMatches':sorted(set(r['matchedMembers'] for r in rolls if r['chamber']=='Senate'))}))
