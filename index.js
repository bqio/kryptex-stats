require("dotenv").config();
const axios = require("axios");
const { VK } = require("vk-io");

const vk = new VK({
  pollingGroupId: process.env.GROUP_ID,
  token: process.env.TOKEN,
});

async function main() {
  setInterval(loop, 3600000);
}

async function loop() {
  const data = await getCurrentKryptexStats(process.env.COOKIE);
  const btc = await getCurrentBtc();
  await vk.api.messages.send({
    user_id: process.env.USER_ID,
    random_id: Date.now(),
    message: `${new Date().toLocaleString()}\n\nВсего решений: ${
      data[0]
    }\nПодтвержденные решения: ${data[1]}\nПроверяемые решения: ${
      data[2]
    }\nДоступно для выплаты: ${data[3]}\nЗапрошены к снятию: ${
      data[4]
    }\nДоход за всё время: ${data[5]}\n\nКурс BTC: $${btc}`,
  });
}

function getCurrentKryptexStats(cookieRaw) {
  const reg = /<span class="text-middle">(\$.*?)<\/span>/gm;
  return new Promise(async (res) => {
    const { data } = await axios.get("https://www.kryptex.org/site/balance", {
      withCredentials: true,
      headers: {
        Cookie: cookieRaw,
      },
    });
    let result;
    let arr = [];
    while ((result = reg.exec(data)) !== null) {
      arr.push(result[1]);
    }
    res(arr);
  });
}

async function getCurrentBtc() {
  const { data } = await axios.get("https://blockchain.info/ticker");
  return data.USD.last;
}

main();
