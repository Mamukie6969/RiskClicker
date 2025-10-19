fetch('/leaderboard')
    .then(res => res.json())
    .then(data => {

        const list = document.getElementById('leaderboard');
        list.innerText = '';

        data.forEach(entry => {
            const li = document.createElement('li');
            li.innerText = `${entry.name}: ${entry.score}`;
            list.appendChild(li);
        });

    });