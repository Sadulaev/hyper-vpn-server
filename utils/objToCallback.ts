export default (obj: {[key: string]: string | number}) => {
    let resultCallback = '';

    console.log(obj)

    Object.entries(obj).forEach(([key, value], index) => {
        if(value) {
            resultCallback = `${resultCallback}${index === 0 ? '' : '&'}${key}-${value}`;
        }
    })

    console.log(resultCallback);

    return resultCallback;
}