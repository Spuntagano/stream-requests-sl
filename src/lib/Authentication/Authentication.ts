// @ts-ignore
import * as jwt from 'jsonwebtoken';
import Streamlabs from '../../types/Streamlabs';

export default class Authentication{
    public streamlabs: Streamlabs;

    constructor(streamlabs?: Streamlabs){
        this.streamlabs = streamlabs;
    }

    // set the token in the authentication componenent state
    // this is naive, and will work with whatever token is returned. under no circumstances should you use this logic to trust private data- you should always verify the token on the backend before displaying that data.
    setToken(streamlabs: Streamlabs){
        try {
            jwt.decode(streamlabs.token);
            this.streamlabs = streamlabs;
        } catch (e) {
            this.streamlabs = null;
        }
    }

    getStreamlabs() {
        return this.streamlabs;
    }

    // checks to ensure there is a valid token in the state
    isAuthenticated(){
        return !!(this.streamlabs);
    }

    /**
     * Makes a call against a given endpoint using a specific method.
     *
     * Returns a Promise with the Request() object per fetch documentation.
     *
     */

    makeCall(url: string, method: string = "GET", body: object = undefined): Promise<object> {
        return new Promise<object>((resolve: any, reject: any)=>{
            if(this.isAuthenticated()){
                let headers={
                    'Content-Type':'application/json',
                    'Authorization': `Bearer ${this.streamlabs.jwtToken}`
                };

                fetch(url,
                    {
                        method,
                        body: JSON.stringify(body),
                        headers,
                    })
                    .then((response) => {
                        if (response.ok) {
                            resolve(response);
                        } else {
                            reject(response);
                        }
                    })
                    .catch(e => reject(e));
            }else{
                reject('Unauthorized');
            }
        })
    }
}
