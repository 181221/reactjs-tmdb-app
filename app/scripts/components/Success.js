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
        <div class="alert alert-success" role="alert">
            This movie was successfully requested!
        </div>
    );
}

export default Error;