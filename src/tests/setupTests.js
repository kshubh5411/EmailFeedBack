require('dotenv').config({ path: '.env.test' });
//configure enzyme to use adapter we want it to use

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({
    adapter: new Adapter()
})