const getRandomColor = (opacity = 1) => {
    const red = getRandomValue(255);
    const green = getRandomValue(255);
    const blue = getRandomValue(255);

    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

const getRandomValue = (upperBound) => Math.floor(Math.random() * upperBound);

module.exports = {
    getRandomColor
}