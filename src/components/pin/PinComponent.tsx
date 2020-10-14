import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { store } from 'src/firebase';
import "./Pin.css";

const pinTimeout = 1000*60*1;

let lastPinCheck: number;

export const Component = (props: any) => {
    const [isLoading, setLoading] = useState(true);
    const [pinEntered, setPinEntered] = useState<boolean>();
    const [hasPin, setHasPin] = useState<boolean>(false);
    const [pin, setPin] = useState<string>();
    const [authUser] = useState(props.authUser);
  
    const pinRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => {
        setLoading(true);
        let mounted = true;
        if(authUser) {
            store.getSettings(props.authUser.uid).then(doc => {
                if(mounted) {
                    if(doc != null && doc.data()) {
                        const data: any = doc.data();
                        if(data.pin) {
                            setHasPin(true);
                            setPin(data.pin);
                            if(lastPinCheck && lastPinCheck + pinTimeout > Date.now()) {
                                setPinEntered(true)
                            } else {
                                setPinEntered(false)
                            }
                        }
                    } else {
                        setHasPin(false);
                        setPinEntered(false)
                    }
                    setLoading(false);
                }
            });
        }
        return () => {
            mounted = false;
        }
    }, [authUser]);

    const valueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(pin === event.target.value) {
          setPinEntered(true);
          lastPinCheck = Date.now();
        }
      }
    
    useLayoutEffect(() => {
        if(hasPin === true && pinEntered === false) {
            pinRef?.current?.focus();
        }
    })

    if(isLoading) {
        return(
            <div className="cssload-container">
            <div className="cssload-speeding-wheel"/>
            </div>
        );
    } else if(hasPin === true && (pinEntered === undefined || pinEntered === false)) {
        return(
            <div className="pin">      
            <p>Enter PIN to access Journal</p>
            <input ref={pinRef} type="password" autoComplete="off" minLength={4} maxLength={8} size={8}  onChange={valueChanged}/>
          </div>
        )
    } else {
        return(props.children);
    }
}