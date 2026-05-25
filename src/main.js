(() => {
    /**
    * @typedef {Object} HttpResponse
    * @property {number} code
    * @property {string} body
    */

    /**
     * @typedef {Object} AuthState
     * @property {string} token
     * @property {number} authTime
     */

    /**
    * @typedef {Object} EventAndCallback
    * @property {string} event
    * @property {()} callback
    */

    /**
    * Performs a HTTP request. Returns a Promise filled with HttpResponse object
    * @param {string} url URL for HTTP request
    * @param {string} method The HTTP request method
    * @param {string} payload The request payload
    * @param {boolean} isJSON A flag for payload as JSON. False value indicates plain/text payloads
    * @returns {Promise<HttpResponse>}
    */
    const doHttpsRequest = async (url, method, payload, isJSON) => {
        const response = await fetch(
            url, method === "GET" ? { method: "GET", mode: "cors" } : {
                method: method,
                mode: "cors",
                body: payload,
                headers: { "Content-Type": isJSON ? "application/json" : "text/plain" }
            })
        const body = response.ok ? response.headers.get("Content-Type") === "application/json" ? response.json() : response.text() : Promise.resolve("")
        return Promise.resolve({ code: response.status, body: await body })
    }

    /**
     * Gets a JSON info from server. Returns a Promise filled with a string, is the string value is empty 
     * something went wrong with the request
     * @param {string} path Server path for get the JSON
     * @returns {Promise<string>} 
     */
    const getJSON = async (path) => {
        const host = "https://server-for-esp-default-rtdb.firebaseio.com"
        const response = await doHttpsRequest(host + path, "GET", "", false)
        return response.code === 200 ? Promise.resolve(response.body) : Promise.resolve("")
    }

    /**
     * Sends a JSON info to the server. Returns a Promise filled with boolean value, true if success and false if failed
     * @param {string} path Server path for send the JSON
     * @param {string} json The JSON payload
     * @returns {Promis<boolean>}
     */
    const sendJSON = async (path, json) => {
        const host = "https://server-for-esp-default-rtdb.firebaseio.com"
        const response = await doHttpsRequest(host + path, "PUT", json, true)
        return Promise.resolve(response.code === 200)
    }

    /**
     * Sends a text info to the server. Returns a Promise filled with boolean value, true if success and false if failed
     * @param {string} path Server path for send the text
     * @param {string} txt The text payload
     * @returns {Promis<boolean>}
     */
    const sendTXT = async (path, txt) => {
        const host = "https://server-for-esp-default-rtdb.firebaseio.com"
        const response = await doHttpsRequest(host + path, "PUT", txt, false)
        return Promise.resolve(response.code === 200)
    }

    /**
     * Gets the authentication state from session storage
     * @returns {AuthState}
     */
    const getAuthState = () => (sessionStorage.getItem("auth")) ?
        Object.freeze(JSON.parse(sessionStorage.getItem("auth"))) :
        Object.freeze({ token: "", authTime: 0 })

    /**
     * Checks if the parameter represents a auth state object
     * @param {AuthState} authState 
     */
    const isAuthState = (authState) => authState !== null && authState !== undefined &&
        authState.authTime !== null && authState.authTime !== undefined &&
        authState.token !== null && authState.token !== undefined

    /**
     * Sets the authentication state in session storage
     * @param {AuthState} authState 
     */
    const setAuthState = (authState) => isAuthState(authState) ?
        sessionStorage.setItem("auth", JSON.stringify(authState)) :
        sessionStorage.setItem("auth", "")

    /** Gets authentication token from from server. Returns a Promise filled with the auth token or with a empty string if 
     * something went wrong
     * @param {string} login Login for authentication
     * @param {string} password Password for authentication
     * @returns {Promise<string>}
     */
    const getAuthToken = async (login, password) => {
        const url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCVryIMYxHjRp_8cswCZgh9W0SJxb6MGfg"
        const userInfo = { "email": login, "password": password, "returnSecureToken": true }
        const response = await doHttpsRequest(url, "POST", JSON.stringify(userInfo), true)
        return response.code === 200 ? JSON.parse(response.body).idToken ? Promise.resolve(JSON.parse(response.body).idToken) : Promise.resolve("") : Promise.resolve("")
    }

    /**
     * Checks if is authenticated
     * @returns {boolean}
     */
    const isAutheticated = () => {
        const authState = getAuthState()
        return authState.token !== "" &&
            authState.authTime !== "" &&
            new Date().getTime() - authState.authTime < 3600 * 1000
    }

    /**
     * Performs the authentication. 
     * @param {string} login Login for authentication
     * @param {string} password Password for authentication
     * @returns {boolean}
     */
    const authenticate = async (login, password) => {
        const token = await getAuthToken(login, password)
        const authState = Object.freeze({ token: token, authTime: new Date().getTime() })
        setAuthState(authState)
        return isAutheticated()
    }

    /**
     * Allow perform safe recursion
     * @param {()} fn A functions to be executed in recursion
     * @returns 
     */
    const trampoline = (fn) => (...args) => {
        let result = fn(...args)
        while (typeof result === "function") result = result()
        return result;
    }

    /**
     * Allow perform safe recursion with async functions
     * @param {()} fn A functions to be executed in recursion
     * @returns 
     */
    const asyncTrampoline = (fn) => async (...args) => {
        let result = await fn(...args)
        while (typeof result === "function") result = await result()
        return result;
    }

    /**
     * Attaches events to html elements
     * @param {EventAndCallback []} eventsAndCallbacks An array of eventAndCallbacks objects
     */
    const attachEvents = (eventsAndCallbacks) => eventsAndCallbacks.forEach(
        (item) => document.addEventListener(item.event, item.callback)
    )

    /**
     * Sets the device name in session storage
     * @param {string} device The device name
     * @returns {string}
     */
    const setDevice = (device) => device && typeof device === "string" ?
        sessionStorage.setItem("device", device) : sessionStorage.setItem("device", "")

    /**
     * Gets the device name from session storage
     * @returns {string}
     */
    const getDevice = () => sessionStorage.getItem("device") ? sessionStorage.getItem("device") : ""

    /**
     * Renders the html ui
     * @param {string} htmlAsString The html elements as string
     */
    const renderHTML = (htmlAsString) => {
        (htmlAsString && typeof htmlAsString === "string") ?
            document.body.innerHTML = `<div id="modal"></div> <main>${htmlAsString}</main>` :
            document.body.innerHTML = document.body.innerHTML
    }


})()