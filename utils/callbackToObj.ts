export default (data: string) => {
  const valuesArray = data.split('&');

  const result = {};

  valuesArray.forEach((field, index) => {
    if (index !== 0 && field !== '') {
      result[field.split('-')[0]] = field.split('-')[1];
    }
  });

  console.log(result);

  return result;
};
