

const plot = (function () {

    /**
     * @typedef {Object} PlotSettings Scatter plot settings 
     * @property {String} font Font used in the graph text
     * @property {number} fontSize The size of the font used in the graph text
     * @property {number} width Graph width in pixels (default value = 700)
     * @property {number} height Graph height in pixels (default value = 560)
     * @property {String} xLabel The x axis label
     * @property {String} yLabel The y axis label
     * @property {boolean} grid Flag for show or not the graph grid
     * @property {number} xMax The maximum value for x axis (if undefined ou null it will be defined 
     * by max value in the data values)
     * @property {number} xMin The minimum value for x axis (if undefined ou null it will be defined 
     * by max value in the data values)
     * @property {number} yMax The maximum value for y axis (if undefined ou null it will be defined 
     * by max value in the data values)
     * @property {number} yMin The minimum value for y axis (if undefined ou null it will be defined 
     * by max value in the data values)
     * @property {number} pointSize The data point size
     * @property {number} xDecimalPlaces Number of decimal places for x axis data
     * @property {number} yDecimalPlaces Number of decimal places for y axis data
     * @property {number} graphAxisMarksInterval The interval between graph axis marks
     * @property {number} graphFrameThickness The thickness of graph frame
     * @property {number} graphAxisMarksThickness The thickness of graph axis marks
     * @property {number} graphFrameSetback The graph frame setback
     * @property {boolean} biggerMarks Flag to show or not the graph axis bigger marks
     * @property {boolean} smallerMarks Flag to show or not the graph axis smaller marks
     */

    /**
     * @typedef {Object} Data The data to be plotted
     * @property {number []} x Values of x
     * @property {number []} y Values of y
     * @property {string} color Color name or hexadecimal color code
     * @property {boolean} fill Flag to sinalize if data point is filled 
     * @property {number} pointSize The size of point to data plot
     */

    /**
     * @typedef {Object} MaxAndMinValues Maximum and minimum values of data set
     * @property {number} xMax Maximum x values for data set
     * @property {number} xMin Minimum x values for data set 
     * @property {number} yMax Maximum y values for data set
     * @property {number} yMin Minimum y values for data set
     */

    /**
     * @type {string} The svg name space
     */
    const svgNameSpace = "http://www.w3.org/2000/svg"

    /**
     * @type {PlotSettings} The default plot settings
     */
    const defaultSettings = Object.freeze({
        font: "SourceSansPro-Regular",
        fontSize: 16,
        width: 700,
        height: 560,
        legend: false,
        xLabel: "x axis",
        yLabel: "y axis",
        grid: false,
        xMax: 0,
        xMin: 0,
        yMax: 0,
        yMin: 0,
        pointSize: 2,
        xDecimalPlaces: 0,
        yDecimalPlaces: 0,
        graphAxisMarksInterval: 6,
        graphAxisMarksThickness: 2,
        graphFrameThickness: 2,
        graphFrameSetback: 4,
        biggerMarks: true,
        smallerMarks: false
    })

    /**
     * Gets a randon hexadecimal color code
     * @returns {string} The random hexadecimal color code
     */
    function getRandomHexColor() {
        const randomNumber = Math.floor(Math.random() * 16777215);
        const hexString = randomNumber.toString(16);
        const fullHexString = hexString.padStart(6, '0');
        return `#${fullHexString}`;
    }

    /**
     * Verify the plot settings
     * @param {PlotSettings} settings Plot settings
     * @returns {PlotSettings} The verified plot settings
     */
    function verifySettings(settings) {
        if (!settings) return defaultSettings
        const verified = {}
        for (const keyValue in defaultSettings) {
            //console.log(keyValue)
            if (!settings[keyValue]) {
                verified[keyValue] = defaultSettings[keyValue]
                continue
            }
            if (typeof settings[keyValue] !== typeof defaultSettings[keyValue]) throw new Error("Invalid settings!")
            verified[keyValue] = settings[keyValue]
        }
        return verified
    }

    /**
     * Verify data
     * @param {Data} data Data object containing x and y values
     * @returns {Data} The verified data object
     */
    function verifyData(data) {
        if (!data || !data.x || !data.y || !data.x instanceof Array || !data.y instanceof Array || data.x.length != data.y.length)
            throw new Error("invalid data structure!")
        if (!data.fill || typeof data.fill !== "boolean") data.fill = false
        if (!data.color) data.color = getRandomHexColor()
        return data
    }

    /**
     * Verify data set
     * @param {Data []} dataSet The data set
     * @returns {Data []} The verified data set
     */
    function verifyDataSet(dataSet) {
        const verified = []
        if (!dataSet instanceof Array) throw new Error("Invalid data set!")
        try {
            for (const data of dataSet) verified.push(verifyData(data))
            return verified
        } catch (error) {
            throw error
        }
    }

    /**
     * Define the maximum and minimum values for a data set
     * @param {Data []} dataSet The data set
     * @param {PlotSettings} verifiedSettings The verified plot settings
     * @returns {MaxAndMinValues} The maximum and minimum values for data set
     */
    function defineMaxAndMinValuesForData(dataSet, verifiedSettings) {

        const values = {
            xMax: verifiedSettings.xMax,
            xMin: verifiedSettings.xMin,
            yMax: verifiedSettings.yMax,
            yMin: verifiedSettings.yMin
        }

        for (const data of dataSet) {
            for (const x of data.x) {
                if (x > values.xMax) values.xMax = x
                if (x < values.xMin) values.xMin = x
            }
            for (const y of data.y) {
                if (y > values.yMax) values.yMax = y
                if (y < values.yMin) values.yMin = y
            }
        }
        return values
    }

    /**
     * Creates a graph frame
     * @param {number} width Svg element width
     * @param {number} height Svg element height
     * @param {number} gap The gap among svg limits and the graph axis
     */
    function createGraphFrame(width, height, graphFrameSetback, graphFrameThickness) {
        const setback = height > width ? height * graphFrameSetback / 100 : 2 * width * graphFrameSetback / 100
        const graphX0 = 2 * setback
        const graphY0 = graphFrameThickness + setback
        const graphWidth = width - 2 * graphX0//2 * graphFrameSetback - graphFrameThickness 
        const graphHeight = height - 2 * graphY0 //2 * graphFrameSetback - graphFrameThickness 
        const frame = document.createElementNS(svgNameSpace, "rect")
        frame.setAttributeNS(null, "id", "frame")
        frame.setAttributeNS(null, "x", graphX0)
        frame.setAttributeNS(null, "y", graphY0)
        frame.setAttributeNS(null, "width", graphWidth)
        frame.setAttributeNS(null, "height", graphHeight)
        frame.setAttributeNS(null, "fill", "white")
        frame.setAttributeNS(null, "stroke", "black")
        frame.setAttributeNS(null, "stroke-width", graphFrameThickness)
        return {
            frame: frame,
            graphX0: graphX0,
            graphY0: graphY0,
            graphHeight: graphHeight,
            graphWidth: graphWidth
        }
    }

    /**
     * Creates the points 
     * @param {number} pointSize The point size
     * @param {MaxAndMinValues} maxAndMinValues The object containing the maximum and minimum values of data set
     * @param {number} graphX0 The x coordenate of graph
     * @param {number} graphY0 The y coordenate of graph
     * @param {number} graphHeight The graph frame height
     * @param {number} graphWidth The graph frame width
     * @param {Data} data The data to be plotted
     * @returns {SVGAElement []} The svg elements that represents the points
     */
    function createGraphPoints(pointSize, maxAndMinValues, graphX0, graphY0, graphHeight, graphWidth, data) {
        const xConversionFactor = graphWidth / (maxAndMinValues.xMax - maxAndMinValues.xMin)
        const yConversionFactor = graphHeight / (maxAndMinValues.yMax - maxAndMinValues.yMin)
        //const coordenates = []
        const points = []

        for (let i = 0; i < data.x.length; i++) {
            const pair = []
            const pointThickness = 2
            const fillColor = data.fill ? data.color : "white"
            //equations checked by hand
            const x = graphX0 + (data.x[i] - maxAndMinValues.xMin) * xConversionFactor
            const y = graphY0 - (data.y[i] - maxAndMinValues.yMax) * yConversionFactor //inverted signal because Y decrease while the cartesian value increase
            pair.push(x, y)
            //coordenates.push(pair)
            const point = document.createElementNS(svgNameSpace, "circle");
            point.setAttributeNS(null, "class", "point")
            point.setAttributeNS(null, "cx", x)
            point.setAttributeNS(null, "cy", y)
            point.setAttributeNS(null, "r", !data.pointSize ? pointSize : data.pointSize);
            point.setAttributeNS(null, "fill", fillColor)
            point.setAttributeNS(null, "stroke", data.color)
            point.setAttributeNS(null, "stroke-width",pointThickness)
            points.push(point)
        }
        //console.log(coordenates)
        return points
    }

    /**
     * Creates the points 
     * @param {MaxAndMinValues} maxAndMinValues The object containing the maximum and minimum values of data set
     * @param {number} graphX0 The x coordenate of graph
     * @param {number} graphY0 The y coordenate of graph
     * @param {number} graphHeight The graph frame height
     * @param {number} graphWidth The graph frame width
     * @param {Data} data The data to be plotted
     * @returns {SVGAElement []} The svg elements that represents the points
     */
    function createGraphLines(maxAndMinValues, graphX0, graphY0, graphHeight, graphWidth, data) {
        const xConversionFactor = graphWidth / (maxAndMinValues.xMax - maxAndMinValues.xMin)
        const yConversionFactor = graphHeight / (maxAndMinValues.yMax - maxAndMinValues.yMin)
        //const coordenates = []
        const lines = []

        for (let i = 0; i < data.x.length - 1; i++) {
            const pair = []
            const lineThickness = 2
            const fillColor = data.fill ? data.color : "white"
            //equations checked by hand
            const x1 = graphX0 + (data.x[i] - maxAndMinValues.xMin) * xConversionFactor
            const y1 = graphY0 - (data.y[i] - maxAndMinValues.yMax) * yConversionFactor //inverted signal because Y decrease while the cartesian value increase
            const x2 = graphX0 + (data.x[i+1] - maxAndMinValues.xMin) * xConversionFactor
            const y2 = graphY0 - (data.y[i+1] - maxAndMinValues.yMax) * yConversionFactor //inverted signal because Y decrease while the cartesian value increase
            //pair.push(x, y)
            //coordenates.push(pair)
            const line = document.createElementNS(svgNameSpace, "line");
            line.setAttributeNS(null, "class", "line")
            line.setAttributeNS(null, "x1", x1)
            line.setAttributeNS(null, "y1", y1)
            line.setAttributeNS(null, "x2", x2)
            line.setAttributeNS(null, "y2", y2)
            line.setAttributeNS(null, "fill", fillColor)
            line.setAttributeNS(null, "stroke", data.color)
            line.setAttributeNS(null, "stroke-width",lineThickness)
            lines.push(line)
        }
        //console.log(coordenates)
        return lines
    }
    /**
     * Creates the graph marks
     * @param {PlotSettings} verifiedSettings The verified plot settings
     * @param {number} graphX0 The x coordenate of graph
     * @param {number} graphY0 The y coordenate of graph
     * @return { SVGAElement []} The svg elements that represents axis graph marks
     */
    function createGraphAxisMarks(graphX0, graphY0, graphHeight, graphWidth, axisMarksInterval) {
        const marks = []
        const markThickness = 2
        const biggerMarkLenght = 10
        const smallerMarkLenght = biggerMarkLenght / 2
        //x axis
        let position = graphX0
        for (let i = 0; i < axisMarksInterval; i++) {
            const biggerMark = document.createElementNS(svgNameSpace, "line")
            biggerMark.setAttributeNS(null, "x1", position)
            biggerMark.setAttributeNS(null, "x2", position)
            biggerMark.setAttributeNS(null, "y1", graphY0 + graphHeight - biggerMarkLenght)
            biggerMark.setAttributeNS(null, "y2", graphY0 + graphHeight)
            biggerMark.setAttributeNS(null, "stroke", "black")
            biggerMark.setAttributeNS(null, "stroke-width", markThickness)
            marks.push(biggerMark)

            const smallerMark = document.createElementNS(svgNameSpace, "line")
            smallerMark.setAttributeNS(null, "x1", position + graphWidth / axisMarksInterval / 2)
            smallerMark.setAttributeNS(null, "x2", position + graphWidth / axisMarksInterval / 2)
            smallerMark.setAttributeNS(null, "y1", graphY0 + graphHeight - smallerMarkLenght)
            smallerMark.setAttributeNS(null, "y2", graphY0 + graphHeight)
            smallerMark.setAttributeNS(null, "stroke", "black")
            smallerMark.setAttributeNS(null, "stroke-width", markThickness)
            marks.push(smallerMark)

            position += (graphWidth / axisMarksInterval)
        }
        //y axis
        position = graphY0
        for (let i = 0; i < axisMarksInterval; i++) {
            const biggerMark = document.createElementNS(svgNameSpace, "line")
            biggerMark.setAttributeNS(null, "y1", position)
            biggerMark.setAttributeNS(null, "y2", position)
            biggerMark.setAttributeNS(null, "x1", graphX0)
            biggerMark.setAttributeNS(null, "x2", graphX0 + biggerMarkLenght)
            biggerMark.setAttributeNS(null, "stroke", "black")
            biggerMark.setAttributeNS(null, "stroke-width", markThickness)
            marks.push(biggerMark)

            const smallerMark = document.createElementNS(svgNameSpace, "line")
            smallerMark.setAttributeNS(null, "y1", position + graphHeight / axisMarksInterval / 2)
            smallerMark.setAttributeNS(null, "y2", position + graphHeight / axisMarksInterval / 2)
            smallerMark.setAttributeNS(null, "x1", graphX0)
            smallerMark.setAttributeNS(null, "x2", graphX0 + smallerMarkLenght)
            smallerMark.setAttributeNS(null, "stroke", "black")
            smallerMark.setAttributeNS(null, "stroke-width", markThickness)
            marks.push(smallerMark)

            position += (graphHeight / axisMarksInterval) //+ (markThickness / 2)
        }
        return marks
    }

    /**
    * Creates the graph grid
    * @param {PlotSettings} verifiedSettings The verified plot settings
    * @param {number} graphX0 The x coordenate of graph
    * @param {number} graphY0 The y coordenate of graph
    * @return { SVGAElement []} The svg elements that represents the graph grids
    */
    function createGraphAxisGrid(graphX0, graphY0, graphHeight, graphWidth, axisMarksInterval) {
        const grids = []
        const gridThickness = 1
        const dashed = 5
        //x axis
        let position = graphX0
        for (let i = 0; i < axisMarksInterval; i++) {
            const xGrid = document.createElementNS(svgNameSpace, "line")
            xGrid.setAttributeNS(null, "x1", position)
            xGrid.setAttributeNS(null, "x2", position)
            xGrid.setAttributeNS(null, "y1", graphY0)
            xGrid.setAttributeNS(null, "y2", graphY0 + graphHeight)
            xGrid.setAttributeNS(null, "stroke", "gray")
            xGrid.setAttributeNS(null, "stroke-width", gridThickness)
            xGrid.setAttributeNS(null, "stroke-dasharray", dashed)
            grids.push(xGrid)
            position += (graphWidth / axisMarksInterval)
        }
        //y axis
        position = graphY0
        for (let i = 0; i < axisMarksInterval; i++) {
            const yGrid = document.createElementNS(svgNameSpace, "line")
            yGrid.setAttributeNS(null, "y1", position)
            yGrid.setAttributeNS(null, "y2", position)
            yGrid.setAttributeNS(null, "x1", graphX0)
            yGrid.setAttributeNS(null, "x2", graphX0 + graphWidth)
            yGrid.setAttributeNS(null, "stroke", "black")
            yGrid.setAttributeNS(null, "stroke-width", gridThickness)
            yGrid.setAttributeNS(null, "stroke-dasharray", dashed)
            grids.push(yGrid)
            position += (graphHeight / axisMarksInterval) //+ (markThickness / 2)
        }
        return grids
    }

    /**
     * Creates the text of graph axis
     * @param {PlotSettings} verifiedSettings The verified plot settings
     * @param {MaxAndMinValues} maxAndMinValues The object containing the maximum and minimum values of data set
     * @param {number} graphX0 The x coordenate of graph
     * @param {number} graphY0 The y coordenate of graph
     * @return { SVGAElement []} The svg elements that represents the axis text 
     */
    function createGraphAxisText(graphX0, graphY0, graphHeight, graphWidth, verifiedSettings, maxAndMinValues) {
        const texts = []
        //x axis
        let position = graphX0
        const xInterval = (maxAndMinValues.xMax - maxAndMinValues.xMin) / verifiedSettings.graphAxisMarksInterval
        let number = maxAndMinValues.xMin
        for (let i = 0; i <= verifiedSettings.graphAxisMarksInterval; i++) {
            const text = document.createElementNS(svgNameSpace, "text")
            text.setAttributeNS(null, "x", position)
            text.setAttributeNS(null, "y", graphY0 + graphHeight + verifiedSettings.fontSize * 2)
            text.setAttributeNS(null, "text-anchor", "middle")
            text.setAttributeNS(null, "font-family", verifiedSettings.font)
            text.setAttributeNS(null, "font-size", verifiedSettings.fontSize)
            text.textContent = number.toFixed(verifiedSettings.xDecimalPlaces)
            texts.push(text)
            position += (graphWidth / verifiedSettings.graphAxisMarksInterval)
            number += xInterval
        }
        // y axis
        position = graphY0
        number = maxAndMinValues.yMax
        const yInterval = (maxAndMinValues.yMax - maxAndMinValues.yMin) / verifiedSettings.graphAxisMarksInterval
        for (let i = 0; i <= verifiedSettings.graphAxisMarksInterval; i++) {
            const text = document.createElementNS(svgNameSpace, "text")
            text.setAttributeNS(null, "y", position + verifiedSettings.fontSize / 2)
            text.setAttributeNS(null, "x", graphX0 - verifiedSettings.fontSize * 3)
            text.setAttributeNS(null, "text-anchor", "middle")
            text.setAttributeNS(null, "font-family", verifiedSettings.font)
            text.setAttributeNS(null, "font-size", verifiedSettings.fontSize)
            text.textContent = number.toFixed(verifiedSettings.yDecimalPlaces)
            texts.push(text)
            position += (graphHeight / verifiedSettings.graphAxisMarksInterval)
            number -= yInterval
        }
        return texts
    }

    /**
     * Creates the label of graph axis
     * @param {PlotSettings} verifiedSettings The verified plot settings
     * @param {MaxAndMinValues} maxAndMinValues The object containing the maximum and minimum values of data set
     * @param {number} graphX0 The x coordenate of graph
     * @param {number} graphY0 The y coordenate of graph
     * @return { SVGAElement []} The svg elements that represents the axis label 
     */
    function createGraphAxisLabel(graphX0, graphY0, graphHeight, graphWidth, verifiedSettings) {
        const labels = []
        let x, y
        //x axis
        x = graphX0 + graphWidth / 2
        y = 2 * graphY0 + graphHeight - verifiedSettings.fontSize / 2
        const xAxisLabel = document.createElementNS(svgNameSpace, "text")
        xAxisLabel.setAttributeNS(null, "x", x)
        xAxisLabel.setAttributeNS(null, "y", y)
        xAxisLabel.setAttributeNS(null, "text-anchor", "middle")
        xAxisLabel.setAttributeNS(null, "font-weight", "bold")
        xAxisLabel.setAttributeNS(null, "font-family", verifiedSettings.font)
        xAxisLabel.setAttributeNS(null, "font-size", verifiedSettings.fontSize * 1.20)
        xAxisLabel.textContent = verifiedSettings.xLabel
        labels.push(xAxisLabel)
        //y axis
        x = graphX0 - graphX0 / 2 - verifiedSettings.fontSize
        y = graphY0 + graphHeight / 2
        const yAxisLabel = document.createElementNS(svgNameSpace, "text")
        yAxisLabel.setAttributeNS(null, "x", x)
        yAxisLabel.setAttributeNS(null, "y", y)
        yAxisLabel.setAttributeNS(null, "text-anchor", "middle")
        yAxisLabel.setAttributeNS(null, "font-weight", "bold")
        yAxisLabel.setAttributeNS(null, "font-family", verifiedSettings.font)
        yAxisLabel.setAttributeNS(null, "font-size", verifiedSettings.fontSize * 1.20)
        yAxisLabel.setAttributeNS(null, "font-size", verifiedSettings.fontSize * 1.20)
        yAxisLabel.setAttributeNS(null, "transform", `rotate(-90, ${x}, ${y})`)
        yAxisLabel.textContent = verifiedSettings.yLabel
        labels.push(yAxisLabel)
        return labels
    }


    return Object.seal({

        /**
         * Get a new svg scatter plot
         * @param {PlotSettings} settings Graph settings
         * @param {Data []} dataSet Data set
         */
        newSVGScatterPlot(settings, dataSet) {
            try {
                /**
                 * @type {PlotSettings} Verified plot settings
                 */
                const verifiedSettings = verifySettings(settings)
                /**
                 * @type {Data []} Verified data set
                 */
                const verifiedDataSet = verifyDataSet(dataSet)
                /**
                 * @type {MaxAndMinValues} The object that containing the maximum and minimum values of data set
                 */
                const maxAndMinValues = defineMaxAndMinValuesForData(verifiedDataSet, verifiedSettings)
                const width = verifiedSettings.width + 6 * verifiedSettings.fontSize
                const height = verifiedSettings.height + 5 * verifiedSettings.fontSize
                const elements = []
                const svg = document.createElementNS(svgNameSpace, "svg")
                svg.setAttributeNS(null, "viewBox", `0 0 ${width} ${height}`)
                svg.setAttributeNS(null, "xlms", svgNameSpace)
                const { frame, graphX0, graphY0, graphHeight, graphWidth } = createGraphFrame(width, height, verifiedSettings.graphFrameSetback, verifiedSettings.graphFrameThickness)
                elements.push(frame)
                const marks = createGraphAxisMarks(graphX0, graphY0, graphHeight, graphWidth, verifiedSettings.graphAxisMarksInterval)
                elements.push(...marks)
                if (verifiedSettings.grid) {
                    const grids = createGraphAxisGrid(graphX0, graphY0, graphHeight, graphWidth, verifiedSettings.graphAxisMarksInterval)
                    elements.push(...grids)
                }
                for (const data of verifiedDataSet) {
                    const points = createGraphPoints(verifiedSettings.pointSize, maxAndMinValues, graphX0, graphY0, graphHeight, graphWidth, data)
                    elements.push(...points)
                }
                const texts = createGraphAxisText(graphX0, graphY0, graphHeight, graphWidth, verifiedSettings, maxAndMinValues)
                elements.push(...texts)
                const labels = createGraphAxisLabel(graphX0, graphY0, graphHeight, graphWidth, verifiedSettings)
                elements.push(...labels)
                elements.forEach(m => svg.append(m))
                return Object.seal({
                    /**
                     * Get the grapg as svg
                     * @returns {SVGAElement} The graph as a svg element
                     */
                    getSVG() {
                        return svg
                    }
                })
            } catch (error) {
                console.log(error)
            }
        },

         /**
         * Get a new svg scatter plot
         * @param {PlotSettings} settings Graph settings
         * @param {Data []} dataSet Data set
         */
        newSVGLinePlot(settings, dataSet) {
            try {
                /**
                 * @type {PlotSettings} Verified plot settings
                 */
                const verifiedSettings = verifySettings(settings)
                /**
                 * @type {Data []} Verified data set
                 */
                const verifiedDataSet = verifyDataSet(dataSet)
                /**
                 * @type {MaxAndMinValues} The object that containing the maximum and minimum values of data set
                 */
                const maxAndMinValues = defineMaxAndMinValuesForData(verifiedDataSet, verifiedSettings)
                const width = verifiedSettings.width + 6 * verifiedSettings.fontSize
                const height = verifiedSettings.height + 5 * verifiedSettings.fontSize
                const elements = []
                const svg = document.createElementNS(svgNameSpace, "svg")
                svg.setAttributeNS(null, "viewBox", `0 0 ${width} ${height}`)
                svg.setAttributeNS(null, "xlms", svgNameSpace)
                const { frame, graphX0, graphY0, graphHeight, graphWidth } = createGraphFrame(width, height, verifiedSettings.graphFrameSetback, verifiedSettings.graphFrameThickness)
                elements.push(frame)
                const marks = createGraphAxisMarks(graphX0, graphY0, graphHeight, graphWidth, verifiedSettings.graphAxisMarksInterval)
                elements.push(...marks)
                if (verifiedSettings.grid) {
                    const grids = createGraphAxisGrid(graphX0, graphY0, graphHeight, graphWidth, verifiedSettings.graphAxisMarksInterval)
                    elements.push(...grids)
                }
                for (const data of verifiedDataSet) {
                    const lines = createGraphLines(maxAndMinValues, graphX0, graphY0, graphHeight, graphWidth, data)
                    elements.push(...lines)
                }
                const texts = createGraphAxisText(graphX0, graphY0, graphHeight, graphWidth, verifiedSettings, maxAndMinValues)
                elements.push(...texts)
                const labels = createGraphAxisLabel(graphX0, graphY0, graphHeight, graphWidth, verifiedSettings)
                elements.push(...labels)
                elements.forEach(m => svg.append(m))
                return Object.seal({
                    /**
                     * Get the grapg as svg
                     * @returns {SVGAElement} The graph as a svg element
                     */
                    getSVG() {
                        return svg
                    }
                })
            } catch (error) {
                console.log(error)
            }
        }
    })
})()
