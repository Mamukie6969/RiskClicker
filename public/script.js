let score = 0;
let resetChance = 1;
const clickSound = new Audio('clickSound.mp4');
function handleClick() {
    clickSound.play();
    if (Math.random() * 100 < resetChance) {
        score = 0;
        resetChance = 1;
    } else {

        score++;
        if (resetChance < 100) resetChance++;
    }

    document.getElementById('score').textContent = score;
    document.getElementById('chance').textContent = resetChance;
}


function submitScore() {

    const name = document.getElementById('nameInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    if (!name || !password) return alert('please provide name as well the password');

    fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, score })

    })
        .then(res => res.json())

        .then(data => {

            if (data.success) {

                alert('score submitted');

                score = 0;
                resetChance = 1;
                document.getElementById('score').textContent = score;
                document.getElementById('chance').textContent = resetChance;

            } else {

                alert('submission failed');
            }
        })
        .catch(error => {
            console.error('network/server error', error);
            alert('submission failed due to network/server error');
        });

}