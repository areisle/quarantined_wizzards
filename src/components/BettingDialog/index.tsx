import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    TextFieldProps,
} from '@material-ui/core';
import React, { useState } from 'react';

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
        const { value } = e.target;
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
            onClose={onClose}
            open={open}
        >
            <DialogTitle>
                Enter the number of tricks you think you can win
            </DialogTitle>
            <DialogContent>
                <TextField
                    aria-label='bet'
                    autoFocus={true}
                    fullWidth={true}
                    id='bet'
                    inputProps={{
                        step: 1,
                        max,
                        min: 0,
                    }}
                    onChange={handleChange}
                    onKeyPress={handleOnKeyPress}
                    type='number'
                    value={bet ?? ''}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color='primary'
                    disabled={bet === null || bet > max || bet < 0}
                    onClick={handleBetPlaced}
                    variant='contained'
                >
                    Place bet
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export {
    BettingDialog,
};
