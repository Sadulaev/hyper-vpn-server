
type PaymentInfo = {
    mrh_login: string;     // ваш логин
    mrh_pass1: string;     // пароль #1
    mrh_pass2: string;     // пароль #2
    inv_id: number;        // номер счета в магазине
    inv_desc: string;      // описание
    out_summ: string;      // сумма
}

async function getPaymentURL(payment: PaymentInfo) {
    const { mrh_login, mrh_pass1, inv_id, inv_desc, out_summ } = payment;
    const signature = require('crypto')
        .createHash('md5')
        .update([mrh_login, out_summ, inv_id, mrh_pass1].join(':'))
        .digest('hex');

    // Собираем URL (как в вашем примере на PHP)
    const url = `https://auth.robokassa.ru/Merchant/Index.aspx?` +
        `MerchantLogin=${encodeURIComponent(mrh_login)}` +
        `&OutSum=${encodeURIComponent(out_summ)}` +
        `&InvId=${encodeURIComponent(inv_id)}` +
        `&Description=${encodeURIComponent(inv_desc)}` +
        `&SignatureValue=${encodeURIComponent(signature)}` + 
        '&Culture=ru';

    // Выполняем GET-запрос (обычно будет редирект на платежную страницу)
    const res = await fetch(url, { redirect: "follow" });
    console.log("Status:", res.status);
    console.log("Final URL:", res.url); // конечный URL после редиректов

    return res.url;
}

export default getPaymentURL;