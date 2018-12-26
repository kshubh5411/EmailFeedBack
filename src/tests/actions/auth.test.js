import {login, logout} from '../../actions/auth';

test('should setup login action correctly', () => {
    const uid = '123abc';
    const action = login(uid);
    expect(action).toEqual({
        type: 'LOGIN',
        uid
    })
})

test('should setup logout action correctly', () => {
    const action = logout();
    expect(action).toEqual({
        type: 'LOGOUT',
    })
})