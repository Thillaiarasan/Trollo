import { userConstants } from './constants';
import { userService } from '../services';
import { alertActions } from './alertActions';
import { history } from '../helpers';
import axios from 'axios';
const passHash = require('password-hash');



export function createUser(user) {
    return axios({
        method: 'post',
        url: 'http://localhost:4000/userCreate',
        data: user,
    })
        .then(function (response) {
            debugger
            console.log(response.data)




            var person = {firstName:"John", lastName:"Doe", age:50, eyeColor:"blue"};

            return(person);
            //this.props.history.push('/login');
        })
        .catch(function (error) {
            return(error);
        });


    function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
    function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
    function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
}






export const userActions = {
    login,
    logout,
    register,
    getAll,
    delete: _delete
};

function login(email, password) {
    let user = {
        username: email,
        password: password
    }
    return axios({
        method: 'post',
        url: 'http://localhost:4000/login',
        data: user,
    })
        .then(function (response) {
            console.log(response)
            return(response);
        })
        .catch(function (error) {
            return(error);
        });

    function updateUser(user) { return { type: userConstants.UPDATE_USER_STATE, user}}
    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}



function logout() {
    userService.logout();
    return { type: userConstants.LOGOUT };
}

function register(user) {
   /* return dispatch => {
        dispatch(request(user));

        userService.register(user)
            .then(
                user => { 
                    dispatch(success());
                    history.push('/login');
                    dispatch(alertActions.success('Registration successful'));
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };*/


        return axios({
            method: 'post',
            url: 'http://localhost:4000/userCreate',
            data: user,
        })
            .then(function (response) {
                debugger
                console.log(response.data)
                return(response.data);
                this.props.history.push('/login');
            })
            .catch(function (error) {
                return(error);
            });


    function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
    function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
    function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
}

function getAll() {
    return dispatch => {
        dispatch(request());

        userService.getAll()
            .then(
                users => dispatch(success(users)),
                error => dispatch(failure(error.toString()))
            );
    };

    function request() { return { type: userConstants.GETALL_REQUEST } }
    function success(users) { return { type: userConstants.GETALL_SUCCESS, users } }
    function failure(error) { return { type: userConstants.GETALL_FAILURE, error } }
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
    return dispatch => {
        dispatch(request(id));

        userService.delete(id)
            .then(
                user => dispatch(success(id)),
                error => dispatch(failure(id, error.toString()))
            );
    };

    function request(id) { return { type: userConstants.DELETE_REQUEST, id } }
    function success(id) { return { type: userConstants.DELETE_SUCCESS, id } }
    function failure(id, error) { return { type: userConstants.DELETE_FAILURE, id, error } }
}

