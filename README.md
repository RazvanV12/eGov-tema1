# eGov Tema 1 - Formular Electronic Plata Amenda Parcare

## Cerințe

- **Java 21** sau mai recent
- **Maven 3.6+**
- **MongoDB** (local sau remote) pe portul 27017

## Pași pentru rulare

### 1. Verifică cerințele

Verifică că ai instalat:
```bash
java -version  # Trebuie să fie Java 21 sau mai recent
mvn -version   # Trebuie să fie Maven 3.6+
```

### 2. Pornește MongoDB

Aplicația necesită MongoDB care rulează pe `localhost:27017`.

**Opțiunea 1: MongoDB instalat local**
```bash
# Windows (dacă MongoDB e în PATH)
mongod

# Linux/Mac
sudo systemctl start mongod
# sau
mongod
```

**Opțiunea 2: MongoDB în Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Opțiunea 3: MongoDB Atlas (cloud)**
- Actualizează `application.properties` cu connection string-ul tău

### 3. Compilează proiectul

```bash
# Din directorul rădăcină al proiectului
mvn clean install
```

### 4. Rulează aplicația

**Opțiunea 1: Folosind Maven**
```bash
mvn spring-boot:run
```

**Opțiunea 2: Folosind wrapper-ul Maven (mvnw)**
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

**Opțiunea 3: Din IDE (IntelliJ IDEA, Eclipse, etc.)**
- Deschide proiectul în IDE
- Caută clasa `EGovTema1Application.java`
- Rulează metoda `main()`

### 5. Accesează aplicația

După ce aplicația pornește (va afișa în consolă "Started EGovTema1Application"), deschide browserul la:

**Frontend (Formularul):**
- http://localhost:8080
- http://localhost:8080/index.html

**API Endpoints:**
- `POST /api/amenzi` - Creează o amenda nouă
- `GET /api/amenzi/pv/{numarPV}` - Obține amenda după număr proces verbal
- `POST /api/plati` - Trimite formularul de plată

## Structura Proiectului

```
eGov-tema1/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/personal/egovtema1/
│   │   │       ├── controller/      # REST Controllers
│   │   │       ├── service/         # Business Logic
│   │   │       ├── repository/      # MongoDB Repositories
│   │   │       ├── entity/          # Entity classes
│   │   │       ├── dto/             # Data Transfer Objects
│   │   │       └── config/          # Configuration
│   │   └── resources/
│   │       ├── static/              # Frontend files
│   │       │   ├── index.html      # Formular HTML
│   │       │   ├── styles.css      # Stiluri
│   │       │   └── script.js       # JavaScript logic
│   │       └── application.properties
│   └── test/
└── pom.xml
```

## Testare

### Testare manuală

1. **Creează o amenda (opțional, pentru test):**
```bash
curl -X POST http://localhost:8080/api/amenzi \
  -H "Content-Type: application/json" \
  -d '{
    "nrInmatriculareMasina": "B123ABC",
    "zona": "Zona 1",
    "codAgent": "AG001",
    "valoareAmenda": 200
  }'
```

2. **Deschide formularul în browser:**
   - Accesează http://localhost:8080
   - Completează formularul
   - Introduce numărul proces verbal pentru a încărca automat datele
   - Calculează suma
   - Generează ordin de plată
   - Trimite formularul

### Funcționalități Frontend

- ✅ **Validare în timp real** - Toate câmpurile sunt validate
- ✅ **Calcule automate** - Reducere 50% în primele 30 zile, penalități progresive după
- ✅ **Corelare câmpuri** - Se încarcă automat amenda după număr proces verbal
- ✅ **Generare ordin de plată** - Format TXT descărcabil
- ✅ **Trimitere către backend** - Datele se trimit și salvează în MongoDB

## Dezvoltare

### Compilare cu MapStruct

Dacă faci modificări la mapper-ele MapStruct, recompilează:
```bash
mvn clean compile
```

### Logs

Log-urile aplicației se afișează în consolă. Pentru debug, verifică:
- MongoDB connection
- API requests în Network tab din browser
- Console JavaScript pentru erori frontend

## Troubleshooting

### MongoDB Connection Error
```
Could not connect to MongoDB
```
**Soluție:** Verifică că MongoDB rulează pe `localhost:27017`

### Port 8080 deja ocupat
```
Port 8080 is already in use
```
**Soluție:** Schimbă portul în `application.properties`:
```properties
server.port=8081
```

### Eroare la compilare MapStruct
**Soluție:** Rulează `mvn clean install` pentru a regenera mapper-ele

## Note

- Aplicația va crea automat colecțiile în MongoDB la prima rulare
- Datele de test pot fi populate automat prin `DataInitConfig` (dacă e configurată)
- Frontend-ul este servit static din `src/main/resources/static`

