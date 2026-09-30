const person=RECEIPTS_DATA.politicians.find(p=>p.id===new URLSearchParams(location.search).get('id'));
document.getElementById('receipt').innerHTML=person ? ReceiptsCore.card(person,RECEIPTS_DATA.meta) : '<p style="padding:25px">Member not found in this snapshot. <a href="index.html">Find a member of Congress</a>.</p>';
document.title=person ? `${person.name} · Receipts` : 'Member not found · Receipts';
