const InputMasks = Object.freeze({
    integer: Object.freeze({
        /**
         * 
         * @param {String} htmlInputId The id of html input element 
         */
        apply(htmlInputId) {
            const input = document.getElementById(htmlInputId)
            if (input === null || input === undefined)
                throw new Error("The html element got by id is null or undefined")
            if (input.tagName !== "INPUT")
                throw new Error("The html element got by id don't correspond to html input!")
            if (input.type !== "text")
                throw new Error("The input got by id don't correspond a text type input!")
            const mask = Object.freeze({
                input: input,
                delLastChar() {
                    this.input.value = this.input.value.slice(0, this.input.value.length - 1)
                },
                mask() {
                    const lastChar = this.input.value[this.input.value.length - 1]
                    const allowedChars = "0123456789"
                    if (!allowedChars.includes(lastChar)) this.delLastChar()
                }

            })
            input.addEventListener("input", () => mask.mask())
        }
    }),
    decimal: Object.freeze({
        /**
         * 
         * @param {String} htmlInputId The id of html input element 
         */
        apply(htmlInputId) {
            const input = document.getElementById(htmlInputId)

            if (input === null || input === undefined)
                throw new Error("The html element got by id is null or undefined")
            if (input.tagName !== "INPUT")
                throw new Error("The html element got by id don't correspond to html input!")
            if (input.type !== "text")
                throw new Error("The input got by id don't correspond a text type input!")
            const mask = Object.freeze({
                input: input,
                decimalSeparator: ".",
                delLastChar() {
                    this.input.value = this.input.value.slice(0, this.input.value.length - 1)
                },
                countDecimalSeparator() {
                    let count = 0
                    for (const char of this.input.value) if (char === this.decimalSeparator) count++
                    return count
                },
                mask() {
                    if (this.countDecimalSeparator() > 1) {
                        this.delLastChar()
                        return
                    }
                    const lastChar = this.input.value[this.input.value.length - 1]
                    const allowedChars = "0123456789" + this.decimalSeparator
                    if (!allowedChars.includes(lastChar)) this.delLastChar()
                }

            })
            input.addEventListener("input", () => mask.mask())
        }
    })
})