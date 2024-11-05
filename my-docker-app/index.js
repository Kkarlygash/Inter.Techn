const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override'); // добавьте это
const app = express();
const PORT = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // добавьте это

app.set('view engine', 'ejs');
app.set('views', './views');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB қосылды"))
.catch(err => console.error("MongoDB қосылмады. ERROR!!!:", err));

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    city: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

app.post('/users', async (req, res) => {
    console.log("Енгізілген деректер:", req.body);
    try {
        const student = new Student({
            name: req.body.name,
            age: req.body.age,
            city: req.body.city
        });
        await student.save();
        console.log("Студент сақталды:", student);
        res.redirect('/');
    } catch (error) {
        console.error("Қателік:", error);
        res.status(500).send("Студент сақталмады");
    }
});

// Обработчик для удаления студента
app.delete('/users/:id', async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).send("Студент не найден");
        }
        res.send("Студент успешно удален");
    } catch (error) {
        res.status(500).send("Ошибка при удалении студента");
    }
});

app.get('/', async (req, res) => {
    const users = await Student.find();
    res.render('index', { users });
});

app.listen(PORT, () => {
    console.log(`Сервер http://localhost:${PORT} портында жүріп тұр`);
});
