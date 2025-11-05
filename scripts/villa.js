document.addEventListener('DOMContentLoaded', () => {
  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // Star rating setup
  const starsContainer = document.getElementById('stars');
  let rating = 0;

  starsContainer.addEventListener('click', e => {
    if(e.target.textContent === '★'){
      const children = [...starsContainer.childNodes];
      const index = children.indexOf(e.target);
      rating = index + 1;
      updateStars();
    }
  });

  starsContainer.addEventListener('mouseover', e => {
    const children = [...starsContainer.childNodes];
    const index = children.indexOf(e.target);
    if(index > -1) children.forEach((star,i)=> star.style.color = i <= index ? '#FFD700' : '#ccc');
  });

  starsContainer.addEventListener('mouseout', updateStars);

  function updateStars(){
    const children = [...starsContainer.childNodes];
    children.forEach((star,i)=> star.style.color = i < rating ? '#FFD700' : '#ccc');
  }

  // Initialize stars
  starsContainer.innerHTML = '★★★★★'.split('').map(c => `<span>${c}</span>`).join('');

  // Submit feedback
  document.getElementById('submitFeedback').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const comment = document.getElementById('comment').value.trim();

    if(!email || !comment || rating === 0){
      alert('Please enter email, comment, and rate the service.');
      return;
    }

    // Save to Firebase
    await db.collection('feedback').add({
      email: email,
      comment: comment,
      rating: rating,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Add to page
    addFeedbackCard(email, comment, rating);

    // Reset form
    document.getElementById('email').value = '';
    document.getElementById('comment').value = '';
    rating = 0;
    updateStars();
  });

  // Load existing feedback
  async function loadFeedback(){
    const feedbackDisplay = document.getElementById('feedbackDisplay');
    feedbackDisplay.innerHTML = '';
    const snapshot = await db.collection('feedback').orderBy('timestamp','desc').get();
    snapshot.forEach(doc => {
      const data = doc.data();
      addFeedbackCard(data.email, data.comment, data.rating);
    });
  }

  function addFeedbackCard(email, comment, rating){
    const feedbackDisplay = document.getElementById('feedbackDisplay');
    const feedbackCard = document.createElement('div');
    feedbackCard.style.cssText = 'background:white; padding:20px; border-radius:10px; width:300px; box-shadow:0 4px 8px rgba(0,0,0,0.1); text-align:left;';
    feedbackCard.innerHTML = `
      <div style="color:#FFD700; font-size:20px; margin-bottom:10px;">${'★'.repeat(rating)}</div>
      <p>${comment}</p>
      <h4 style="margin-top:10px;">- ${email}</h4>
    `;
    feedbackDisplay.appendChild(feedbackCard);
  }

  loadFeedback();
});
