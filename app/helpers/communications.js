var axios = require('axios');

const sendElasticEmail = async (to, obj) => {

    const { collectionURL,
        collectionSize,
        assetsCount
    } = obj
    var data = JSON.stringify({
        "Recipients": {
            "To": to,
            "CC": [],
            "BCC": []
        },
        "Content": {
            "Body": [],
            "Merge": {
                "collectionURL": collectionURL,
                "collectionSize": collectionSize,
                "assetsCount": assetsCount
            },
            "Attachments": [],
            "Headers": {},
            "Postback": "string",
            "EnvelopeFrom": "NFT Dynamo <send@nftdynamo.xyz>",
            "From": "NFT Dynamo <send@nftdynamo.xyz>",
            "ReplyTo": "NFT Dynamo <send@nftdynamo.xyz>",
            "Subject": "Collection generated!",
            "TemplateName": "collectionReady",
            "AttachFiles": "",
            "Utm": {}
        },
        "Options": {
            "TrackOpens": "true",
            "TrackClicks": "true"
        }
    });

    var config = {
        method: 'post',
        url: 'https://api.elasticemail.com/v4/emails/transactional',
        headers: {
            'X-ElasticEmail-ApiKey': process.env.ELASTICEMAIL_API_KEY,
            'Content-Type': 'application/json'
        },
        data: data
    };

    return axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });

}

module.exports = {
    sendElasticEmail
}
