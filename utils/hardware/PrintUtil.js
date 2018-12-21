/**
 * Data: 2018/12/20
 * Auth: Dongyunlong
 * Desc: 打印工具类
 */
let u = {};

/**
 * 打印
 */
u.print = function (name, number, color, qr) {
	var str = '';
	str += 'SIZE 400 mm,600 mm';
	str += 'DENSITY 15\n';
	str += 'CLS\n';
	str += 'TEXT 20,20,"TSS24.BF2",0,1.5,1.5,"' + name + '"\n';
	str += 'TEXT 20,60,"TSS24.BF2",0,1.5,1.5,"' + number + '"\n';
	str += 'TEXT 20,100,"TSS24.BF2",0,1.5,1.5,"' + color + '"\n';
	str += 'QRCODE 15,140,L,10,A,0,"' + qr + '"\n';
	str += 'PRINT 1\n'
	return str;
}

module.exports = u;