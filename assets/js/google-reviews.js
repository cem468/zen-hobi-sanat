(function(){
  // TODO: Google Cloud Console'dan alınan gerçek değerlerle doldurun.
  // 1) placeId: Google İşletme Profili'nizin Place ID'si (Place ID Finder ile bulunur).
  // 2) apiKey: "Places API (New)" etkinleştirilmiş, HTTP referrer ile zenhobisanat.com
  //    alan adına kısıtlanmış bir Google Maps API anahtarı.
  var CONFIG = {
    placeId: 'ChIJMyzhBHpZtRQREKLWyH6eWOg',
    apiKey: 'AIzaSyCRw-bdAFNSMEORfoYfE-nJLMTQHuRAQtU'
  };

  var summaryEl = document.getElementById('gr-summary');
  var listEl = document.getElementById('gr-reviews');
  var linkEl = document.getElementById('gr-all-link');
  if(!summaryEl || !listEl) return;

  function esc(s){
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function starString(rating){
    var full = Math.round(rating || 0);
    var s = '';
    for(var i = 0; i < 5; i++) s += i < full ? '★' : '☆';
    return s;
  }

  function initials(name){
    return (name || '').trim().split(/\s+/).slice(0, 2).map(function(w){ return w.charAt(0) || ''; }).join('').toUpperCase();
  }

  function renderSummary(data){
    summaryEl.innerHTML =
      '<div class="gr-score">' + esc(data.rating != null ? data.rating.toFixed(1) : '–') + '</div>' +
      '<span class="stars">' + starString(data.rating) + '</span>' +
      '<div class="gr-count">' + esc(data.userRatingCount || 0) + ' Google değerlendirmesi</div>';
  }

  function renderReviews(reviews){
    listEl.innerHTML = '';
    if(!reviews || !reviews.length){
      listEl.innerHTML = '<div class="gr-state">Henüz görüntülenecek yorum yok.</div>';
      return;
    }
    reviews.slice(0, 5).forEach(function(r, i){
      var text = (r.originalText && r.originalText.text) || (r.text && r.text.text) || '';
      var name = (r.authorAttribution && r.authorAttribution.displayName) || 'Google Kullanıcısı';
      var card = document.createElement('div');
      card.className = 'quote-card';
      card.innerHTML =
        '<span class="stars">' + starString(r.rating) + '</span>' +
        '<p>' + esc(text) + '</p>' +
        '<div class="quote-foot"><span class="av">' + esc(initials(name)) + '</span><div><div class="nm">' + esc(name) + '</div><div class="rl">' + esc(r.relativePublishTimeDescription || 'Google Yorumu') + '</div></div></div>';
      listEl.appendChild(card);
    });
  }

  function showError(){
    summaryEl.innerHTML = '';
    listEl.innerHTML = '<div class="gr-state">Yorumlar şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin ya da Google\'daki sayfamızı ziyaret edin.</div>';
  }

  if(!CONFIG.placeId || CONFIG.placeId === 'YOUR_PLACE_ID' || !CONFIG.apiKey || CONFIG.apiKey === 'YOUR_API_KEY'){
    summaryEl.innerHTML = '';
    listEl.innerHTML = '<div class="gr-state">Google yorumları yakında burada — bağlantı kurulum aşamasında.</div>';
    return;
  }

  fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(CONFIG.placeId), {
    headers: {
      'X-Goog-Api-Key': CONFIG.apiKey,
      'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews,googleMapsUri'
    }
  })
  .then(function(res){ if(!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
  .then(function(data){
    renderSummary(data);
    renderReviews(data.reviews);
    if(linkEl && data.googleMapsUri) linkEl.href = data.googleMapsUri;
  })
  .catch(showError);
})();
