$(document).ready(() => {
    console.log('jquery connected');

    // increment rank num
    $( ".leaderboard-rank" ).each(function( index ) {
        $(this).text( parseInt($(this).text()) + 1);
    });

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