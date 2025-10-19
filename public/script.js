let score = 0;
let resetChance = 1;

function handleClick() {
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
    if (!name) return alert('please enter name');

    fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score })

    })
        .then(res => res.json())

        .then(data => {

            if (data.success) {

                alert('score submitted');

            } else {

                alert('submission failed');
            }
        })
        .catch(error => {
            console.error('network/server error', error);
            alert('submission failed due to network/server error');
        });

}