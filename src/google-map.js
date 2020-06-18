async function initMap () {
  const address = document.getElementById('address').textContent
  const URLadress = address.replace(' ', '+')
  const APIkey = 'AIzaSyAgQGZ2ht9bbQxTVuougW0JNplBm1mWqqA'
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${URLadress}&key=${APIkey}`

  const location = await fetch(URL).then(r => r.json())
  const cordenates = location.results[0].geometry.location

  const map = new google.maps.Map(document.getElementById('map'), { zoom: 15, center: cordenates })
  const marker = new google.maps.Marker({ position: cordenates, map: map })
}
