const person=RECEIPTS_DATA.politicians.find(p=>p.id===new URLSearchParams(location.search).get('id'));
document.getElementById('receipt').innerHTML=person ? ReceiptsCore.card(person,RECEIPTS_DATA.meta) : '<p style="padding:25px">Member not found. Use the extension search to choose a supported member.</p>';
