
let interestedBtnDiv = document.querySelector('.interested-btns-div');
let ratingQuestion = document.querySelector('#rating-question');
let ratingForm = document.querySelector('.rating-form');
let ratingInputs = document.querySelectorAll('.rating-input');
let notInterested = document.querySelector('#notInterestedBtn')
let interested = document.querySelector('#interestedBtn');
let interestedInput = document.querySelector('#interested_input');
let notInterestedInput = document.querySelector('#notInterested_input');
let showInterested = document.querySelector('#show_interested');
let ratingFormBtn = document.querySelector('.rating-form-btn');
let chatBtns = document.querySelectorAll('.chat-btns');
let nav = document.querySelector('#nav');
let matchBtn = document.querySelector('#match_btn');
let chatDiv = document.querySelector('#chat-div');
let notifyDiv = document.querySelector('#notify-div');
let notifyBtn = document.querySelector('#notify-btn');
let notifForm = document.querySelector('.notif-form');
let notification = document.querySelectorAll('.notification');
let notifClose = document.querySelectorAll('.notif-close');
let closeForm = document.querySelectorAll('.close-form');
let hours = document.querySelector('#hours');
let mins = document.querySelector('#mins');
let secs = document.querySelector('#secs');
let noLikes = document.querySelector('#noLikes');
let distanceInput = document.querySelector('#distance_input');
let distanceNum = document.querySelector('#distance_num');
let ageInput = document.querySelector('#age_input');
let ageNum = document.querySelector('#age_num');



if (ratingQuestion) {
    showInterested.addEventListener('click', async (event) => {
        ratingQuestion.setAttribute('hidden', true);
        interestedBtnDiv.removeAttribute('hidden');
        showInterested.setAttribute('hidden', true);
    });
    interestedBtnDiv.addEventListener('click', (event) => {
        if (event.target.id === 'interestedBtn') {
            interestedInput.click();
            ratingFormBtn.click();
        } else if (event.target.id === 'notInterestedBtn') {
            notInterestedInput.click();
            ratingFormBtn.click();
            }
    })
};

if (chatBtns) {
    for (let btn of chatBtns) {
        btn.addEventListener('click', async (event) => {
            if (event.path[0].innerText === 'Nix') {
                let match_id = event.path[0].id.match(/nix(.+)/)[1];
                event.path[0].innerText = 'Delete?'
                event.path[0].addEventListener('click', async (event) => {
                    event.path[2].setAttribute('hidden', true);
                    
                    await axios({
                        method: 'delete',
                        url: `http://portfolio:3000/user/${currentUser}/match/${match_id}`,
                        params: {
                            
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(response => { return response })
                        .catch(err => console.log(err));
                        event.path[2].setAttribute('hidden', true)
                    
                });
                
            } else if (event.path[0].innerText === 'Nudge') {
                let match_id = event.path[0].id.match(/nudge(.+)/)[1];
                event.path[0].setAttribute('hidden', true);
                await axios({
                    method: 'post',
                    url: `http://portfolio:3000/user/${currentUser}/match/${match_id}`,
                    data: {
                        nudge: true
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => { return response })
                    .catch(err => console.log(err));

            }
        })
    }
};

if (notifForm) {
    for (let notif of notification) {
        notif.addEventListener('click', async (event) => {
            console.log('notification touched')
            if (event.path[0].classList.contains('notification-body')) {
                console.log(event.path)
                event.path[1].children[1].submit();                
            } else if (event.path[0].classList.contains('notif-close')) {
                console.log(event.path)
                console.log('CLOSING BTN');
                event.path[1].children[2].submit();
                event.path[1].remove();
                }
            })
    }
}
if (noLikes) {
    let timer = function () {
        if (/[8]/.test(hours.innerText) === true) {
            hours.innerText = '07'
            secs.innerText = '59';
            mins.innerText = '59'
        };
        setTimeout(() => {
            
            secs.innerText = parseInt(secs.innerText) - 1
            if (secs.innerText.length < 2) {
                secs.innerText = `0${secs.innerText}`
            };
            if (secs.innerText === ('00' || '0')) {
                secs.innerText = '59';
                mins.innerText = parseInt(mins.innerText) - 1;
                if (secs.innerText.length < 2) {
                    secs.innerText = `0${mins.innerText}`
                };
                if (mins.innerText === ('00' || '0')) {
                    mins.innerText = '59'
                    hours.innerText = parseInt(hours.innerText - 1);
                    if (hours.innerText === '0') {
                        noLikes.innerText = 'Yay, you can start matching again!'
                    }
                }
            }
            timer();
          }, 1000)
    }
    timer();
};

if (distanceInput) {
    distanceInput.addEventListener('click', (event) => {
        distanceNum.innerText = `${(distanceInput.value)*5} miles`;
    })
    ageInput.addEventListener('click', (event) => {
        ageNum.innerText = `${(parseInt(ageInput.value))+18} years old`;
    })
}


///For when your site is encrypted ----------------------------------------------------------
// let getLocation = async () => {
//     let locate = navigator.geolocation;
//     let showLocation = function (position) {
//         let latitude = position.coords.latitude
//         let longitude = position.coords.longitude
//         console.log(latitude);
//         console.log(longitude)
//     };
//     let throwError = function (positionError) {
//         let status = positionError.code;
//         let message = positionError.message
//         console.log(status);
//         console.log(message)
//     }
//     await locate.getCurrentPosition(showLocation, throwError)
//         .then(response => console.log(response))
//         .catch(err => console.log(err));
// };
// getLocation();


