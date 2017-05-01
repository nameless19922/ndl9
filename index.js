const mongoClient = require('mongodb').MongoClient;
const mongoUrl    = 'mongodb://localhost:27017/test';

const users       = {
    db: null,
    collection: null
};

// show list
function showCollection(collection) {
    return collection.find().toArray().then(result => {
        console.log(result);
    })
}

// get random name
function getRandomName() {
    const names = ['James', 'Mark', 'George', 'Ryan', 'Amanda', 'Rob', 'Samanta', 'Mary', 'Kate'];

    return names[Math.floor(Math.random() * names.length)];
}

mongoClient.connect(mongoUrl).then(db => {
    // get users from json
    users.db         = db;
    users.collection = users.db.collection('users');

    const usersList = require('./users').users;

    if (!usersList.length) {
        throw new Error('The list is empty');
    }

    return users.collection.insertMany(usersList);

}).then(result => {

    // show users before update
    console.log('Before update:')
    return showCollection(users.collection);

}).then(result => {

    // looking for some users
    return users.collection.find({ age: { $gt: 20 } }).toArray();

}).then(result => {

    // update some users
    return Promise.all(
        result.map(item => {
            let newName = getRandomName();

            return users.collection.update(
                { _id: item._id },
                { $set: { name:  newName} }
            );
        })
    );

}).then(result => {

    // show users after update
    console.log('After update:')
    return showCollection(users.collection);

}).then(result => {

    // remove changed users
    return users.collection.remove({ age: { $gt: 20 } });

}).then(result => {

    // close db
    users.db.close();

}).catch(err => {

    // catch errors and close db

    console.error(err);
    users.collection.close();

})