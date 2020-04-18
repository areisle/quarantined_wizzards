import React, { useState } from 'react';
import { 
    Button, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle,
    TextField, 
    TextFieldProps, 
} from '@material-ui/core';

interface BettingDialogProps {
    open: boolean;
    onClose: () => void;
    onBetPlaced: (bet: number) => void;
    max: number;
}

function BettingDialog(props: BettingDialogProps) {
    const { 
        open, 
        onClose, 
        max,
        onBetPlaced,
    } = props;
    const [bet, setBet] = useState<number | null>(null);

    const handleChange: TextFieldProps['onChange'] = (e) => {
        const value = e.target.value;
        setBet(value ? Number(value) : null);
    };

    const handleBetPlaced = () => {
        onBetPlaced(bet as number);
        setBet(null);
    };

    const handleOnKeyPress = (event: React.KeyboardEvent) => {
        if (event.charCode === 13) {
            handleBetPlaced();
        }
    };

    return (
        <Dialog 
            open={open}
            onClose={onClose}
        >
            <DialogTitle>
                Enter the number of tricks you think you can win
            </DialogTitle>
            <DialogContent>
                <TextField
                    value={bet ?? ''}
                    onChange={handleChange}
                    type='number'
                    id='bet'
                    aria-label='bet'
                    inputProps={{
                        step: 1,
                        max,
                        min: 0,
                    }}
                    onKeyPress={handleOnKeyPress}
                    fullWidth={true}
                    autoFocus={true}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={bet === null || bet > max || bet < 0 }
                    onClick={handleBetPlaced}
                    color='primary'
                    variant='contained'
                >
                    Place bet
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export {
    BettingDialog,
}