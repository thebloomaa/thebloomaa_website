"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var zones, _i, zones_1, zone, products, _a, products_1, prod;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Seeding fitness meal prep database...');
                    zones = [
                        { pincode: '800001', neighborhood: 'Boring Road', city: 'Patna', state: 'Bihar', isActive: true },
                        { pincode: '800020', neighborhood: 'Kankarbagh', city: 'Patna', state: 'Bihar', isActive: true },
                        { pincode: '800013', neighborhood: 'Patliputra', city: 'Patna', state: 'Bihar', isActive: true }
                    ];
                    _i = 0, zones_1 = zones;
                    _b.label = 1;
                case 1:
                    if (!(_i < zones_1.length)) return [3 /*break*/, 4];
                    zone = zones_1[_i];
                    return [4 /*yield*/, prisma.deliveryZone.upsert({
                            where: { pincode: zone.pincode },
                            update: {},
                            create: zone,
                        })];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('✅ Seeded Delivery Zones (Patna)');
                    products = [
                        {
                            name: 'Lean Muscle Chicken Prep',
                            type: 'MEAL_PLAN',
                            price: 350,
                            description: 'Grilled chicken breast with quinoa and steamed broccoli. Optimized for muscle gain.',
                            calories: 650,
                            protein: 55,
                            carbs: 45,
                            fats: 15,
                            dietaryPreference: 'HIGH_PROTEIN'
                        },
                        {
                            name: 'Vegan Keto Power Bowl',
                            type: 'MEAL_PLAN',
                            price: 300,
                            description: 'Tofu, avocado, spinach, and walnuts in an olive oil dressing. Low carb, high fat.',
                            calories: 500,
                            protein: 20,
                            carbs: 12,
                            fats: 40,
                            dietaryPreference: 'VEGAN'
                        },
                        {
                            name: 'Standard Weight Loss Diet',
                            type: 'MEAL_PLAN',
                            price: 250,
                            description: 'Balanced low-calorie meal with mixed lentils, brown rice, and a side salad.',
                            calories: 400,
                            protein: 18,
                            carbs: 55,
                            fats: 8,
                            dietaryPreference: 'VEG'
                        }
                    ];
                    _a = 0, products_1 = products;
                    _b.label = 5;
                case 5:
                    if (!(_a < products_1.length)) return [3 /*break*/, 8];
                    prod = products_1[_a];
                    return [4 /*yield*/, prisma.product.create({
                            data: prod
                        })];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    _a++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log('✅ Seeded Fitness Products');
                    // 3. Seed Rider
                    return [4 /*yield*/, prisma.rider.upsert({
                            where: { phone: '+919876543210' },
                            update: {},
                            create: {
                                name: 'Raju Rider',
                                phone: '+919876543210',
                                active: true,
                            },
                        })];
                case 9:
                    // 3. Seed Rider
                    _b.sent();
                    console.log('✅ Seeded Rider');
                    console.log('Seeding completed successfully.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
