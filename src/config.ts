export default () => ({
    port: +process.env.PORT,
    database: {
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT || 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    robokassa: {
        merchantId: process.env.ROBOKASSA_MERCHANT_ID,
        merchantPassword1: process.env.ROBOKASSA_MERCHANT_PASSWORD_1,
        merchantPassword2: process.env.ROBOKASSA_MERCHANT_PASSWORD_2,
    },
    tg: {
        token: process.env.TG_TOKEN,
    },
    tgAmdin: {
        token: process.env.TG_ADMIN_TOKEN
    }
});