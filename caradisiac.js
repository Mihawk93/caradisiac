var fs = require('fs');

var caradisiac = [];
var index={"index":{"_index": "cars","_type":"car"}};
const {getModels} = require('node-car-api');

async function print () {
    const models = await getModels('PEUGEOT');
    var json = {};
    json.models = models;
    caradisiac.push(index);
    caradisiac.push(json);
    console.log(models);
    fs.writeFile('output.json', JSON.stringify(caradisiac, null, 4),function(err){});
}
print();
