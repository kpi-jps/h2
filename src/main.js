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
     * 
     * @returns {AuthState}
     */
    const getAuthState = () => (sessionStorage.getItem("auth")) ?
        Object.freeze(JSON.parse(sessionStorage.getItem("auth"))) :
        Object.freeze({ token: "", authTime: 0 })

    /**
     * 
     * @param {AuthState} authState 
     */
    const isAuthState = (authState) => authState !== null && authState !== undefined &&
        authState.authTime !== null && authState.authTime !== undefined &&
        authState.token !== null && authState.token !== undefined

    /**
     * 
     * @param {AuthState} authState 
     */
    const setAuthState = (authState) => isAuthState(authState) ?
        sessionStorage.setItem("auth", JSON.stringify(authState)) :
        sessionStorage.setItem("auth", "")

    /**
     * Allow perform safe recursion
     * @param {()} fn 
     * @returns 
     */
    const trampoline = (fn) => (...args) => {
        let result = fn(...args)
        while (typeof result === "function") result = result()
        return result;
    }

    /**
     * Allow perform safe recursion with async functions
     * @param {()} fn 
     * @returns 
     */
    const asyncTrampoline = (fn) => async (...args) => {
        let result = await fn(...args)
        while (typeof result === "function") result = await result()
        return result;
    }

    /**
     * @param {EventAndCallback []} eventsAndCallbacks 
     */
    const attachEvents = (eventsAndCallbacks) => eventsAndCallbacks.forEach(
        (item) => document.addEventListener(item.event, item.callback)
    )


})()