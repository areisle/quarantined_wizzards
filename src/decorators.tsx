import React from 'react';

const DialogDecorator = (storyFn:any , context: any) => {
    console.log(context);
    return (
        <div
            style={{
                position: 'relative',
                height: 568,
            }}
        >
            {storyFn()}
        </div>
    )
}

const dialogDecoratorArgs = {
    disablePortal: true,
    disableEnforceFocus: true,
    disableScrollLock: true,
    disableAutoFocus: true,
}

export {
    DialogDecorator,
    dialogDecoratorArgs,
}
