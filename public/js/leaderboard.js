$(document).ready(() => {
    console.log('jquery connected');

    $("#save-score-btn").click(() => {
        console.log('saving score');

        let name=$("#name-input").val();
        let score = $('#score').text();
        
        $.post("/game", {name: name,score: score}, (data) => {
            console.log(data);
            if(data === 'success') {
                alert("score saved");
            }
        });
    });
})