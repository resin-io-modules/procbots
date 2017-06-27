"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ATNDeserializer_1 = require("antlr4ts/atn/ATNDeserializer");
const Lexer_1 = require("antlr4ts/Lexer");
const LexerATNSimulator_1 = require("antlr4ts/atn/LexerATNSimulator");
const Decorators_1 = require("antlr4ts/Decorators");
const Decorators_2 = require("antlr4ts/Decorators");
const VocabularyImpl_1 = require("antlr4ts/VocabularyImpl");
const Utils = require("antlr4ts/misc/Utils");
class RASPLexer extends Lexer_1.Lexer {
    constructor(input) {
        super(input);
        this._interp = new LexerATNSimulator_1.LexerATNSimulator(RASPLexer._ATN, this);
    }
    get vocabulary() {
        return RASPLexer.VOCABULARY;
    }
    get grammarFileName() { return "RASP.g4"; }
    get ruleNames() { return RASPLexer.ruleNames; }
    get serializedATN() { return RASPLexer._serializedATN; }
    get modeNames() { return RASPLexer.modeNames; }
    static get _ATN() {
        if (!RASPLexer.__ATN) {
            RASPLexer.__ATN = new ATNDeserializer_1.ATNDeserializer().deserialize(Utils.toCharArray(RASPLexer._serializedATN));
        }
        return RASPLexer.__ATN;
    }
}
RASPLexer.T__0 = 1;
RASPLexer.T__1 = 2;
RASPLexer.T__2 = 3;
RASPLexer.T__3 = 4;
RASPLexer.T__4 = 5;
RASPLexer.T__5 = 6;
RASPLexer.T__6 = 7;
RASPLexer.T__7 = 8;
RASPLexer.T__8 = 9;
RASPLexer.T__9 = 10;
RASPLexer.T__10 = 11;
RASPLexer.T__11 = 12;
RASPLexer.T__12 = 13;
RASPLexer.T__13 = 14;
RASPLexer.T__14 = 15;
RASPLexer.T__15 = 16;
RASPLexer.T__16 = 17;
RASPLexer.INT = 18;
RASPLexer.ALPHA = 19;
RASPLexer.HEX = 20;
RASPLexer.ALPHANUMERIC = 21;
RASPLexer.COMMENT = 22;
RASPLexer.LINE_COMMENT = 23;
RASPLexer.WS = 24;
RASPLexer.modeNames = [
    "DEFAULT_MODE"
];
RASPLexer.ruleNames = [
    "T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "T__7", "T__8",
    "T__9", "T__10", "T__11", "T__12", "T__13", "T__14", "T__15", "T__16",
    "INT", "ALPHA", "HEX", "ALPHANUMERIC", "COMMENT", "LINE_COMMENT", "WS"
];
RASPLexer._LITERAL_NAMES = [
    undefined, "'bot('", "')'", "'{'", "'}'", "'='", "'AddListener('", "','",
    "'AddEmitter('", "'github'", "'flowdock'", "':'", "'RequestEvents('",
    "'['", "']'", "'envar'", "'('", "'/'"
];
RASPLexer._SYMBOLIC_NAMES = [
    undefined, undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, "INT", "ALPHA", "HEX", "ALPHANUMERIC",
    "COMMENT", "LINE_COMMENT", "WS"
];
RASPLexer.VOCABULARY = new VocabularyImpl_1.VocabularyImpl(RASPLexer._LITERAL_NAMES, RASPLexer._SYMBOLIC_NAMES, []);
RASPLexer._serializedATN = "\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02\x1A\xC3\b\x01" +
    "\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06" +
    "\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r" +
    "\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t" +
    "\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t" +
    "\x17\x04\x18\t\x18\x04\x19\t\x19\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02" +
    "\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03\x07" +
    "\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07" +
    "\x03\x07\x03\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
    "\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
    "\n\x03\n\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\f\x03" +
    "\f\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03" +
    "\r\x03\r\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x10\x03\x10\x03" +
    "\x10\x03\x10\x03\x10\x03\x10\x03\x11\x03\x11\x03\x12\x03\x12\x03\x13\x06" +
    "\x13\x8C\n\x13\r\x13\x0E\x13\x8D\x03\x14\x06\x14\x91\n\x14\r\x14\x0E\x14" +
    "\x92\x03\x15\x06\x15\x96\n\x15\r\x15\x0E\x15\x97\x03\x16\x06\x16\x9B\n" +
    "\x16\r\x16\x0E\x16\x9C\x03\x17\x03\x17\x03\x17\x03\x17\x07\x17\xA3\n\x17" +
    "\f\x17\x0E\x17\xA6\v\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x18" +
    "\x03\x18\x03\x18\x03\x18\x07\x18\xB1\n\x18\f\x18\x0E\x18\xB4\v\x18\x03" +
    "\x18\x05\x18\xB7\n\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x19\x06\x19" +
    "\xBE\n\x19\r\x19\x0E\x19\xBF\x03\x19\x03\x19\x04\xA4\xB2\x02\x02\x1A\x03" +
    "\x02\x03\x05\x02\x04\x07\x02\x05\t\x02\x06\v\x02\x07\r\x02\b\x0F\x02\t" +
    "\x11\x02\n\x13\x02\v\x15\x02\f\x17\x02\r\x19\x02\x0E\x1B\x02\x0F\x1D\x02" +
    "\x10\x1F\x02\x11!\x02\x12#\x02\x13%\x02\x14\'\x02\x15)\x02\x16+\x02\x17" +
    "-\x02\x18/\x02\x191\x02\x1A\x03\x02\x07\x03\x022;\x04\x02C\\c|\x05\x02" +
    "2;CHch\b\x02//2;C\\aac|~~\x05\x02\v\f\x0F\x0F\"\"\xCA\x02\x03\x03\x02" +
    "\x02\x02\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02\x02\x02\x02\t\x03\x02" +
    "\x02\x02\x02\v\x03\x02\x02\x02\x02\r\x03\x02\x02\x02\x02\x0F\x03\x02\x02" +
    "\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02\x02\x02\x02\x15\x03\x02\x02" +
    "\x02\x02\x17\x03\x02\x02\x02\x02\x19\x03\x02\x02\x02\x02\x1B\x03\x02\x02" +
    "\x02\x02\x1D\x03\x02\x02\x02\x02\x1F\x03\x02\x02\x02\x02!\x03\x02\x02" +
    "\x02\x02#\x03\x02\x02\x02\x02%\x03\x02\x02\x02\x02\'\x03\x02\x02\x02\x02" +
    ")\x03\x02\x02\x02\x02+\x03\x02\x02\x02\x02-\x03\x02\x02\x02\x02/\x03\x02" +
    "\x02\x02\x021\x03\x02\x02\x02\x033\x03\x02\x02\x02\x058\x03\x02\x02\x02" +
    "\x07:\x03\x02\x02\x02\t<\x03\x02\x02\x02\v>\x03\x02\x02\x02\r@\x03\x02" +
    "\x02\x02\x0FM\x03\x02\x02\x02\x11O\x03\x02\x02\x02\x13[\x03\x02\x02\x02" +
    "\x15b\x03\x02\x02\x02\x17k\x03\x02\x02\x02\x19m\x03\x02\x02\x02\x1B|\x03" +
    "\x02\x02\x02\x1D~\x03\x02\x02\x02\x1F\x80\x03\x02\x02\x02!\x86\x03\x02" +
    "\x02\x02#\x88\x03\x02\x02\x02%\x8B\x03\x02\x02\x02\'\x90\x03\x02\x02\x02" +
    ")\x95\x03\x02\x02\x02+\x9A\x03\x02\x02\x02-\x9E\x03\x02\x02\x02/\xAC\x03" +
    "\x02\x02\x021\xBD\x03\x02\x02\x0234\x07d\x02\x0245\x07q\x02\x0256\x07" +
    "v\x02\x0267\x07*\x02\x027\x04\x03\x02\x02\x0289\x07+\x02\x029\x06\x03" +
    "\x02\x02\x02:;\x07}\x02\x02;\b\x03\x02\x02\x02<=\x07\x7F\x02\x02=\n\x03" +
    "\x02\x02\x02>?\x07?\x02\x02?\f\x03\x02\x02\x02@A\x07C\x02\x02AB\x07f\x02" +
    "\x02BC\x07f\x02\x02CD\x07N\x02\x02DE\x07k\x02\x02EF\x07u\x02\x02FG\x07" +
    "v\x02\x02GH\x07g\x02\x02HI\x07p\x02\x02IJ\x07g\x02\x02JK\x07t\x02\x02" +
    "KL\x07*\x02\x02L\x0E\x03\x02\x02\x02MN\x07.\x02\x02N\x10\x03\x02\x02\x02" +
    "OP\x07C\x02\x02PQ\x07f\x02\x02QR\x07f\x02\x02RS\x07G\x02\x02ST\x07o\x02" +
    "\x02TU\x07k\x02\x02UV\x07v\x02\x02VW\x07v\x02\x02WX\x07g\x02\x02XY\x07" +
    "t\x02\x02YZ\x07*\x02\x02Z\x12\x03\x02\x02\x02[\\\x07i\x02\x02\\]\x07k" +
    "\x02\x02]^\x07v\x02\x02^_\x07j\x02\x02_`\x07w\x02\x02`a\x07d\x02\x02a" +
    "\x14\x03\x02\x02\x02bc\x07h\x02\x02cd\x07n\x02\x02de\x07q\x02\x02ef\x07" +
    "y\x02\x02fg\x07f\x02\x02gh\x07q\x02\x02hi\x07e\x02\x02ij\x07m\x02\x02" +
    "j\x16\x03\x02\x02\x02kl\x07<\x02\x02l\x18\x03\x02\x02\x02mn\x07T\x02\x02" +
    "no\x07g\x02\x02op\x07s\x02\x02pq\x07w\x02\x02qr\x07g\x02\x02rs\x07u\x02" +
    "\x02st\x07v\x02\x02tu\x07G\x02\x02uv\x07x\x02\x02vw\x07g\x02\x02wx\x07" +
    "p\x02\x02xy\x07v\x02\x02yz\x07u\x02\x02z{\x07*\x02\x02{\x1A\x03\x02\x02" +
    "\x02|}\x07]\x02\x02}\x1C\x03\x02\x02\x02~\x7F\x07_\x02\x02\x7F\x1E\x03" +
    "\x02\x02\x02\x80\x81\x07g\x02\x02\x81\x82\x07p\x02\x02\x82\x83\x07x\x02" +
    "\x02\x83\x84\x07c\x02\x02\x84\x85\x07t\x02\x02\x85 \x03\x02\x02\x02\x86" +
    "\x87\x07*\x02\x02\x87\"\x03\x02\x02\x02\x88\x89\x071\x02\x02\x89$\x03" +
    "\x02\x02\x02\x8A\x8C\t\x02\x02\x02\x8B\x8A\x03\x02\x02\x02\x8C\x8D\x03" +
    "\x02\x02\x02\x8D\x8B\x03\x02\x02\x02\x8D\x8E\x03\x02\x02\x02\x8E&\x03" +
    "\x02\x02\x02\x8F\x91\t\x03\x02\x02\x90\x8F\x03\x02\x02\x02\x91\x92\x03" +
    "\x02\x02\x02\x92\x90\x03\x02\x02\x02\x92\x93\x03\x02\x02\x02\x93(\x03" +
    "\x02\x02\x02\x94\x96\t\x04\x02\x02\x95\x94\x03\x02\x02\x02\x96\x97\x03" +
    "\x02\x02\x02\x97\x95\x03\x02\x02\x02\x97\x98\x03\x02\x02\x02\x98*\x03" +
    "\x02\x02\x02\x99\x9B\t\x05\x02\x02\x9A\x99\x03\x02\x02\x02\x9B\x9C\x03" +
    "\x02\x02\x02\x9C\x9A\x03\x02\x02\x02\x9C\x9D\x03\x02\x02\x02\x9D,\x03" +
    "\x02\x02\x02\x9E\x9F\x071\x02\x02\x9F\xA0\x07,\x02\x02\xA0\xA4\x03\x02" +
    "\x02\x02\xA1\xA3\v\x02\x02\x02\xA2\xA1\x03\x02\x02\x02\xA3\xA6\x03\x02" +
    "\x02\x02\xA4\xA5\x03\x02\x02\x02\xA4\xA2\x03\x02\x02\x02\xA5\xA7\x03\x02" +
    "\x02\x02\xA6\xA4\x03\x02\x02\x02\xA7\xA8\x07,\x02\x02\xA8\xA9\x071\x02" +
    "\x02\xA9\xAA\x03\x02\x02\x02\xAA\xAB\b\x17\x02\x02\xAB.\x03\x02\x02\x02" +
    "\xAC\xAD\x071\x02\x02\xAD\xAE\x071\x02\x02\xAE\xB2\x03\x02\x02\x02\xAF" +
    "\xB1\v\x02\x02\x02\xB0\xAF\x03\x02\x02\x02\xB1\xB4\x03\x02\x02\x02\xB2" +
    "\xB3\x03\x02\x02\x02\xB2\xB0\x03\x02\x02\x02\xB3\xB6\x03\x02\x02\x02\xB4" +
    "\xB2\x03\x02\x02\x02\xB5\xB7\x07\x0F\x02\x02\xB6\xB5\x03\x02\x02\x02\xB6" +
    "\xB7\x03\x02\x02\x02\xB7\xB8\x03\x02\x02\x02\xB8\xB9\x07\f\x02\x02\xB9" +
    "\xBA\x03\x02\x02\x02\xBA\xBB\b\x18\x02\x02\xBB0\x03\x02\x02\x02\xBC\xBE" +
    "\t\x06\x02\x02\xBD\xBC\x03\x02\x02\x02\xBE\xBF\x03\x02\x02\x02\xBF\xBD" +
    "\x03\x02\x02\x02\xBF\xC0\x03\x02\x02\x02\xC0\xC1\x03\x02\x02\x02\xC1\xC2" +
    "\b\x19\x02\x02\xC22\x03\x02\x02\x02\v\x02\x8D\x92\x97\x9C\xA4\xB2\xB6" +
    "\xBF\x03\b\x02\x02";
__decorate([
    Decorators_2.Override,
    Decorators_1.NotNull
], RASPLexer.prototype, "vocabulary", null);
__decorate([
    Decorators_2.Override
], RASPLexer.prototype, "grammarFileName", null);
__decorate([
    Decorators_2.Override
], RASPLexer.prototype, "ruleNames", null);
__decorate([
    Decorators_2.Override
], RASPLexer.prototype, "serializedATN", null);
__decorate([
    Decorators_2.Override
], RASPLexer.prototype, "modeNames", null);
exports.RASPLexer = RASPLexer;

//# sourceMappingURL=RASPLexer.js.map
