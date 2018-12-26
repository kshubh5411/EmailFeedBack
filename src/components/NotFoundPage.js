import React from 'react';
import {Link} from 'react-router-dom';

export const NotFoundPage = () => (
    <div>
        <p>404 - <Link to="/">Go Home</Link></p>
    </div>
);

export default NotFoundPage;