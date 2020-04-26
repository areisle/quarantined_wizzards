import React from 'react';
import { Typography, Table, TableBody, TableRow, TableCell, TableHead, Card, CardContent } from '@material-ui/core';

function Rules() {
    return (
        <Card>
            <CardContent>
            <Typography variant='h4'>Game Rules</Typography>
            <Typography variant='h5'>Setup / Dealing</Typography>
            <Typography>the dealer changes each round. first round is player 1, second is player 2 etc.</Typography>
            <Typography>Each player player is dealt the same number of cards as the round number</Typography>
            <Typography>the number of rounds depends on the number of players. 3-6 players are allowed.</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell># of players</TableCell>
                        <TableCell># of rounds</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>3</TableCell>
                        <TableCell>20</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>4</TableCell>
                        <TableCell>15</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>5</TableCell>
                        <TableCell>12</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>6</TableCell>
                        <TableCell>10</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Typography>After the cards are dealt, trump is chosen from the remaining cards.</Typography>
            <Typography variant='h5'>Betting</Typography>
            <Typography>At the start of each round, each player will make a bet on the number of tricks they think they can win during that round.</Typography>
            <Typography variant='h5'>Playing</Typography>
            <Typography>At the start of each round, the player left of the dealer will start the first trick. All tricks after will be started by the winner of the last trick. The number of tricks in the round is the same as the round number. Each player plays one card per trick.</Typography>
            <Typography variant='h6'>Winning A Trick</Typography>
            <Typography>For each trick, the lead suit is the suit first card played during the trick. If a wizard starts the trick, the trick has no lead suit. If a jester starts the trick, the suit of the first non-jester card played is the lead suit</Typography>
            <Typography>The winner of the trick is: the first wizard played; the highest trump card if no wizards; the highest lead card if no trump; or the first jest played if all jesters.</Typography>
            <Typography variant='h5'>Score</Typography>
            <Typography>If a player makes their bet exactly, then they get 20 points for making their bet, plus 10 points for every trick they took. If a player is either over or under, they lose 10 points for each trick they were off by.</Typography>
            </CardContent>
        </Card>
    )
}

export {
    Rules,
}