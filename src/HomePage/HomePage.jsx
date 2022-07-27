import React from 'react';

import { userService, authenticationService } from '@/services';

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            userFromApi: null
        };
    }

    componentDidMount() {
        const { currentUser } = this.state;
        userService.getById(currentUser.id).then(userFromApi => this.setState({ userFromApi }));
    }

    render() {
        const { currentUser, userFromApi } = this.state;
        return (
            <div>
                <p>Your role is: <strong>{currentUser.role}</strong>.</p>
                <h1>Exam Result</h1>
                <p>Your score is </p>
                {
                    userFromApi &&
                    <p><strong>{userFromApi.result}  of 10</strong> </p>
                }
                {
                    userFromApi &&
                    userFromApi.result < 5 ? <p><strong>FAIL</strong></p> : <p><strong>PASS
                    </strong></p>
                }
                <div>
                    {userFromApi &&
                            <p>{userFromApi.firstName} {userFromApi.lastName}</p>
                    }
                </div>
            </div>
        );
    }
}

export { HomePage };