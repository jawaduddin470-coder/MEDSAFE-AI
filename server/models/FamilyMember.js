const mongoose = require('mongoose');

const familyMemberSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    relation: {
        type: String,
        required: [true, 'Please specify relationship'],
    },
    age: {
        type: Number,
    },
    medications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication'
    }]
}, {
    timestamps: true,
});

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
