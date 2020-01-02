import React, {useState, useEffect} from 'react';

const Error = (props) => {
    const [hide, setHide] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setHide(true)
        }, 5000);
        return () => clearTimeout(timer);
      }, []);
    if (hide)
        return <div></div>
    return (
        <div class="alert alert-danger" role="alert">
            Something went wrong
        </div>
    );
}

export default Error;