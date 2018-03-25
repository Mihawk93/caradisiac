const express = require('express');
const client = require('./connection.js');
const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');
const hostname = 'localhost';
const port = 8080;
const app = express();

async function Brands() {
    return await getBrands();
}

async function Models(brand) {
    return await getModels(brand);
}

function getModel(brand) {
    return new Promise((resolve) => {
        Models(brand).then(models => {
        return resolve(models)
    })
})
}

app.route("/suv").get(function (req, res) {
    const query = {
        "sort": [
            {
                "volume": {"order": "desc"}
            }
        ]
    };
    client.search({
        index: "cars",
        type: "car",
        body: query
    }, (err, resp) => {
        res.send(resp)
});
});

app.route("/populate").get(function (req, res) {
    Brands().then(brands => {
        const requests = brands.map(brand => getModel(brand));
    Promise.all(requests).then(results => {
        const models = [].concat.apply([], results);
    const bulk_body = [];
    models.forEach(model => {
        bulk_body.push({index: {_index: 'cars', _type: 'car', _id: model.uuid}});
    bulk_body.push(model)
});
    client.bulk({
        body: bulk_body
    }, (err, resp) => {
        if (err) {
            res.send("New Error : " + err);
        }
        else {
            client.indices.putMapping({
            index: "cars",
            type: "car",
            body: {
                "properties": {
                    "volume": {
                        "type": "text",
                        "fielddata": true
                    }
                }
            }
        }).then(() => {
            res.send(resp);
}).catch((err) => {
        console.log("New Error : " + err)
})
}
})
}).catch(err => console.log("New Error : " + err))
})
});

app.listen(port, hostname, function () {
    console.log("Go to http://localhost:8080/");
});