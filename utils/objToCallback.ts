export default (obj: {[key: string]: string | number}) => {
    let resultCallback = '';

    if(obj) {
        Object.entries(obj).forEach(([key, value]) => {
            if(value) {
                resultCallback = `&${key}-${value}`;
            }
        })
    }

    console.log('in obj = ', obj)
    console.log('out callback = ', resultCallback);

    return resultCallback;
}