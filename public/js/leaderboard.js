$(document).ready(() => {
    console.log('jquery connected');

    // // increment rank num
    // $( ".leaderboard-rank" ).each(function( index ) {
    //     $(this).text( parseInt($(this).text()) + 1);
    // });

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

    // force numerical sorting

    let listings = Array.from($('.leaderboard-listing'));
    $('.leaderboard-listing').remove();

    listings.sort( (a,b) => {
        let aScore = parseInt($(a).find('.leaderboard-score').text());
        let bScore = parseInt($(b).find('.leaderboard-score').text());

        if (aScore == bScore) return 0;
        else if (aScore < bScore) return 1;
        else return -1;
    });

    listings.forEach( (listing, i) => {
        console.log(listing);
        $(listing).find('.leaderboard-rank').text(i + 1);
        $('#leaderboard').append(listing);
    });
})