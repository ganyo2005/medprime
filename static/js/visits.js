(function(){var k='mpvisit',n=sessionStorage.getItem(k);
var csrf=(document.cookie.match(/csrftoken=([^;]+)/)||[])[1]||'';
fetch('/api/visits',{method:n?'GET':'POST',headers:n?{}:{'X-CSRFToken':csrf}}).then(function(r){return r.json()}).then(function(d){sessionStorage.setItem(k,1);document.getElementById('vcn').textContent=Number(d.visits).toLocaleString()}).catch(function(){document.getElementById('vc').style.display='none'})})()
