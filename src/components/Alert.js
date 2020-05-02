import React from 'react'

export const Alert = ({type, text}) => {
    return (
        // backtick `` is used to combine string and variable in JSX
        <div className={`alert alert-${type}`}>
            {text}
        </div>
    )
}
