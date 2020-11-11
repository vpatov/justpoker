

interface User {

    // If authentication solution provides unique id for each user, we will map
    // sessions to JP user data via this id.
    id: number;

    // It's possible all of this information is available through auth provider
    email: string;
    date_joined: number;
    last_login: number;
}

interface GameSummary {}

// all interesting data on a profile is a function of the user's games played
interface Profile {

    name: string;
    games_played: GameSummary;

    // derived fields
    net_winnings: number;
    winnings_this_month: number;
    
    

}