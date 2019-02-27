/**
 * Data: 2018/12/20
 * Auth: Dongyunlong
 * Desc: 打印工具类
 */
let u = {};

/**
 * 打印
 * 
 * 纸张大小 80mm * 40mm = 640dot * 320dot
 */
u.print = function (name, number, color, qr) {
	var str = '';
	str += 'SIZE 80 mm,40 mm\n';
	str += 'DENSITY 15\n';
	str += 'CLS\n';
	str += 'QRCODE 10,20,L,10,A,0,"' + qr + '"\n';
	var line = 1;
	if (name.length <= 16) {
		str += 'TEXT 240,30,"TSS24.BF2",0,1.5,1.5,"' + name + '"\n';
	} else {
		var index = 0;
		do {
			var length = name.length - index > 16 ? 16 : name.length - index;
			str += 'TEXT 240,' + line * 30 + ',"TSS24.BF2",0,1.5,1.5,"' + name.substr(index, length) + '"\n';
			index += length;
			line++;
		} while (index < name.length);
	}
	str += 'TEXT 240,' + line * 30 + ',"TSS24.BF2",0,1.5,1.5,"' + number + '"\n';
	str += 'TEXT 240,' + (line + 1) * 30 + ',"TSS24.BF2",0,1.5,1.5,"' + color + '"\n';
	str += 'PRINT 1\n'
	console.log(str, '打印内容');
	return str;
}

u.backUpOne = function () {
	var str = 'BACKFEED ' + 40 * 8 + '\n';
	str += 'BACKUP ' + 40 * 8 + '\n';
	return str;
}

module.exports = u;