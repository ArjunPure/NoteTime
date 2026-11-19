"use strict";
/* NoteTime math engine: arithmetic checking, linear solving, and calculus (integrals, derivatives, limits, sums). */
const MathEngine = (() => {
  let RAD = false;
  const ang = f => x => f(RAD ? x : x * Math.PI / 180);
  const FUNCS = { sqrt:Math.sqrt, sin:ang(Math.sin), cos:ang(Math.cos), tan:ang(Math.tan), log:Math.log10, ln:Math.log, abs:Math.abs, exp:Math.exp };
  const CONSTS = { pi:Math.PI, e:Math.E };
  const SYM = { pi:'π', e:'e' };
  class MErr extends Error {}
  class NotMath extends Error {}
  const DISP = {'*':'×', '/':'÷'};
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹', SUB = '₀₁₂₃₄₅₆₇₈₉';
  const fromSup = s => s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, c => SUP.indexOf(c)).replace(/⁻/g, '-').replace(/ⁿ/g, 'n').replace(/ˣ/g, 'x').replace(/⁺/g, '+');
  const fromSub = s => s.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => SUB.indexOf(c)).replace(/₋/g, '-');
  const toSup = s => String(s).replace(/\d/g, d => SUP[d]).replace(/-/g, '⁻');
  const toSub = s => String(s).replace(/\d/g, d => SUB[d]).replace(/-/g, '₋');

  function normalize(s){
    return s.replace(/[×✕✖·∙⋅]/g, '*').replace(/[÷∶]/g, '/').replace(/[−–—]/g, '-')
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻ⁿˣ⁺]+/g, m => '^(' + fromSup(m) + ')')
      .replace(/π/g, 'pi').replace(/√/g, ' sqrt ').replace(/∞/g, 'inf')
      .replace(/\|([^|]+)\|/g, 'abs($1)')
      .replace(/(\d),(\d{3})(?!\d)/g, '$1$2')
      .replace(/(\d|\))\s+[xX]\s+(?=[\d(])/g, '$1*');
  }
  function disp(s){ return s.replace(/\s*\*\s*/g, ' × ').replace(/\s*\/\s*/g, ' ÷ ').replace(/sqrt\s*/g, '√').replace(/\^\((\d+)\)/g, (m, d) => toSup(d)).replace(/\s+/g, ' ').trim() }

  function tokenize(s){
    const out = []; let i = 0;
    while (i < s.length){
      const c = s[i];
      if (/\s/.test(c)){ i++; continue }
      if (/[0-9.]/.test(c)){
        let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const raw = s.slice(i, j);
        if ((raw.match(/\./g) || []).length > 1 || raw === '.') throw new MErr(`“${raw}” isn't a valid number`);
        out.push({t:'num', v:parseFloat(raw), raw}); i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)){
        let j = i; while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
        const w = s.slice(i, j).toLowerCase();
        if (FUNCS[w] || w in CONSTS) out.push({t:'id', v:w});
        else if (w.length === 1) out.push({t:'var', v:w});
        else {
          const f = Object.keys(FUNCS).find(k => w.startsWith(k) && w.length - k.length === 1);
          if (!f) throw new NotMath();
          out.push({t:'id', v:f}); const last = w.slice(-1);
          out.push(last in CONSTS ? {t:'id', v:last} : {t:'var', v:last});
        }
        i = j; continue;
      }
      if ('+-*/^%!()'.includes(c)){ out.push({t:'op', v:c}); i++; continue }
      throw new MErr(`Unrecognized symbol “${c}”`);
    }
    return out;
  }

  function parse(tokens){
    let p = 0;
    const peek = () => tokens[p], next = () => tokens[p++];
    const isOp = (t, v) => t && t.t === 'op' && (v === undefined || t.v === v);
    const d = v => DISP[v] || v;
    function operandError(){
      const t = peek(), prev = tokens[p-1];
      if (!t){ if (prev) throw new MErr(`Nothing comes after “${d(prev.v)}”, so the expression is unfinished`); throw new MErr('One side of the “=” is empty') }
      if (isOp(t, ')')) throw new MErr(prev && isOp(prev, '(') ? 'Empty parentheses “()”' : 'Extra closing parenthesis “)”');
      if (t.t === 'op'){
        if (prev && prev.t === 'op' && !')%!'.includes(prev.v)) throw new MErr(`Two operators in a row (“${d(prev.v)} ${d(t.v)}”)`);
        throw new MErr(`Starts with “${d(t.v)}”, with no number before it`);
      }
      throw new MErr('Something is missing here');
    }
    const startsOperand = t => t && (t.t === 'num' || t.t === 'var' || t.t === 'id' || isOp(t, '('));
    function expr(){ let n = term(); while (isOp(peek(), '+') || isOp(peek(), '-')){ const o = next().v; n = {k:'bin', o, a:n, b:term()} } return n }
    function term(){
      let n = unary();
      for (;;){
        const t = peek();
        if (isOp(t, '*') || isOp(t, '/')){ next(); n = {k:'bin', o:t.v, a:n, b:unary()} }
        else if (startsOperand(t)) n = {k:'bin', o:'*', a:n, b:power()};
        else break;
      }
      return n;
    }
    function unary(){ const t = peek(); if (isOp(t, '-')){ next(); return {k:'neg', a:unary()} } if (isOp(t, '+')){ next(); return unary() } return power() }
    function power(){ const b = postfix(); if (isOp(peek(), '^')){ next(); return {k:'pow', a:b, b:unary()} } return b }
    function postfix(){ let n = primary(); while (isOp(peek(), '%') || isOp(peek(), '!')){ const o = next().v; n = {k: o === '%' ? 'pct' : 'fact', a:n} } return n }
    function primary(){
      const t = peek();
      if (!t) operandError();
      if (t.t === 'num'){ next(); return {k:'num', v:t.v} }
      if (t.t === 'var'){ next(); return {k:'var', v:t.v} }
      if (t.t === 'id'){
        next();
        if (t.v in CONSTS) return {k:'num', v:CONSTS[t.v], sym:SYM[t.v]};
        if (!peek()) throw new MErr(`“${t.v === 'sqrt' ? '√' : t.v}” needs something after it`);
        return {k:'fn', f:t.v, a: isOp(peek(), '(') ? primary() : power()};
      }
      if (isOp(t, '(')){
        next();
        if (isOp(peek(), ')')) throw new MErr('Empty parentheses “()”');
        const n = expr();
        if (!isOp(peek(), ')')) throw new MErr('Missing a closing parenthesis “)”');
        next(); return n;
      }
      operandError();
    }
    if (!tokens.length) throw new MErr('One side of the “=” is empty');
    const n = expr();
    if (p < tokens.length){ const t = peek(); if (isOp(t, ')')) throw new MErr('Extra closing parenthesis “)”'); throw new MErr(`Unexpected “${d(t.v)}”`) }
    return n;
  }
  const parseExpr = s => parse(tokenize(normalize(s)));

  function ev(n, vars){
    switch (n.k){
      case 'num': return n.v;
      case 'var': if (vars && n.v in vars) return vars[n.v]; throw new MErr('unknown');
      case 'neg': return -ev(n.a, vars);
      case 'pct': return ev(n.a, vars) / 100;
      case 'fact': { const v = ev(n.a, vars); if (v < 0 || !Number.isInteger(v) || v > 170) throw new MErr('Factorial “!” only works on whole numbers from 0 to 170'); let r = 1; for (let i = 2; i <= v; i++) r *= i; return r }
      case 'pow': return Math.pow(ev(n.a, vars), ev(n.b, vars));
      case 'fn': { const v = ev(n.a, vars); if (n.f === 'sqrt' && v < 0) throw new MErr("Can't take the square root of a negative number"); return FUNCS[n.f](v) }
      case 'bin': { const a = ev(n.a, vars), b = ev(n.b, vars); if (n.o === '/' && b === 0) throw new MErr("Dividing by zero isn't defined"); return n.o === '+' ? a+b : n.o === '-' ? a-b : n.o === '*' ? a*b : a/b }
    }
  }
  function evRad(n, vars){ const prev = RAD; RAD = true; try { return ev(n, vars) } finally { RAD = prev } }
  function varsOf(n, set = new Set()){ if (!n) return set; if (n.k === 'var') set.add(n.v); if (n.a) varsOf(n.a, set); if (n.b) varsOf(n.b, set); return set }
  const hasVar = (n, v) => varsOf(n).has(v);

  /* ---- number formatting ---- */
  function frac(v, tol = 1e-9){ for (let q = 2; q <= 64; q++){ const p = Math.round(v * q); if (Math.abs(p / q - v) < tol * Math.max(1, Math.abs(v))) return [p, q] } return null }
  function fmt(n){
    if (!isFinite(n)) return n > 0 ? '∞' : '-∞';
    if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
    return String(parseFloat(n.toPrecision(8)));
  }
  function fmtNice(v){
    if (!isFinite(v)) return v > 0 ? '∞' : '-∞';
    if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
    if (Math.abs(v - Math.E) < 1e-12) return 'e';
    const fr = frac(v); if (fr) return fr[0] + '/' + fr[1];
    const pf = Math.abs(v / Math.PI - Math.round(v / Math.PI)) < 1e-9 ? [Math.round(v / Math.PI), 1] : frac(v / Math.PI);
    if (pf && pf[1] <= 12 && Math.abs(pf[0]) <= 24) return (pf[0] === 1 ? '' : pf[0] === -1 ? '-' : pf[0]) + 'π' + (pf[1] === 1 ? '' : '/' + pf[1]);
    return String(parseFloat(v.toPrecision(8)));
  }
  function snap(r, tol = 1e-7){
    if (!isFinite(r)) return r;
    if (Math.abs(r - Math.round(r)) < tol * Math.max(1, Math.abs(r))) return Math.round(r);
    const fr = frac(r, tol); return fr ? fr[0] / fr[1] : r;
  }
  function close(a, b, rawB){
    if (!isFinite(a) || !isFinite(b)) return a === b;
    if (Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))) return true;
    const m = rawB && rawB.trim().match(/^-?\d*\.(\d+)$/);
    if (m) return Math.abs(a - b) <= 0.5 * Math.pow(10, -m[1].length) + 1e-12;
    return false;
  }

  /* ---- symbolic algebra ---- */
  const N = v => ({k:'num', v});
  const isNum = n => n.k === 'num';
  const pure = n => isNum(n) && !n.sym;
  const add = (a, b) => ({k:'bin', o:'+', a, b});
  const sub = (a, b) => ({k:'bin', o:'-', a, b});
  const mul = (a, b) => ({k:'bin', o:'*', a, b});
  const div = (a, b) => ({k:'bin', o:'/', a, b});
  const pow = (a, b) => ({k:'pow', a, b});
  const fn = (f, a) => ({k:'fn', f, a});
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  function D(n, v){
    switch (n.k){
      case 'num': return N(0);
      case 'var': return N(n.v === v ? 1 : 0);
      case 'neg': return {k:'neg', a:D(n.a, v)};
      case 'pct': return div(D(n.a, v), N(100));
      case 'fact': if (hasVar(n, v)) throw new MErr("Can't take the derivative of a factorial"); return N(0);
      case 'bin': {
        const a = n.a, b = n.b;
        if (n.o === '+' || n.o === '-') return {k:'bin', o:n.o, a:D(a, v), b:D(b, v)};
        if (n.o === '*') return add(mul(D(a, v), b), mul(a, D(b, v)));
        if (!hasVar(b, v)) return div(D(a, v), b);
        return div(sub(mul(D(a, v), b), mul(a, D(b, v))), pow(b, N(2)));
      }
      case 'pow': {
        const a = n.a, b = n.b;
        if (!hasVar(b, v)) return mul(mul(b, pow(a, sub(b, N(1)))), D(a, v));
        if (!hasVar(a, v)) return mul(mul(n, fn('ln', a)), D(b, v));
        return mul(n, add(mul(D(b, v), fn('ln', a)), div(mul(b, D(a, v)), a)));
      }
      case 'fn': {
        const a = n.a; let g;
        switch (n.f){
          case 'sqrt': g = div(N(1), mul(N(2), n)); break;
          case 'sin': g = fn('cos', a); break;
          case 'cos': g = {k:'neg', a:fn('sin', a)}; break;
          case 'tan': g = div(N(1), pow(fn('cos', a), N(2))); break;
          case 'ln': g = div(N(1), a); break;
          case 'log': g = div(N(1), mul(a, fn('ln', N(10)))); break;
          case 'exp': g = n; break;
          case 'abs': g = div(a, n); break;
        }
        return mul(g, D(a, v));
      }
    }
  }
  const rank = f => f.k === 'var' ? 0 : f.k === 'pow' ? (f.a.k === 'var' ? 1 : 2) : f.k === 'fn' ? 3 : 4;
  function product(a, b){
    const fs = [];
    let c = 1;
    const collect = x => {
      if (x.k === 'bin' && x.o === '*'){ collect(x.a); collect(x.b) }
      else if (x.k === 'neg'){ c = -c; collect(x.a) }
      else if (pure(x)) c *= x.v;
      else fs.push(x);
    };
    collect(a); collect(b);
    if (c === 0) return N(0);
    const merged = [];
    for (const f of fs){
      const isP = f.k === 'pow' && pure(f.b);
      const base = isP ? f.a : f, ex = isP ? f.b.v : 1;
      const m = merged.find(g => same(g.base, base));
      if (m) m.ex += ex; else merged.push({base, ex});
    }
    const out = merged.filter(m => Math.abs(m.ex) > 1e-12).map(m => m.ex === 1 ? m.base : pow(m.base, N(m.ex)));
    out.sort((p, q) => rank(p) - rank(q));
    if (!out.length) return N(c);
    let res = out.reduce((x, y) => mul(x, y));
    if (c === 1) return res;
    if (c === -1) return {k:'neg', a:res};
    if (c < 0) return {k:'neg', a:mul(N(-c), res)};
    return mul(N(c), res);
  }
  function simp(n){
    switch (n.k){
      case 'num': case 'var': return n;
      case 'neg': { const a = simp(n.a); if (pure(a)) return N(-a.v); if (a.k === 'neg') return a.a; return {k:'neg', a} }
      case 'pct': return {k:'pct', a:simp(n.a)};
      case 'fact': return {k:'fact', a:simp(n.a)};
      case 'fn': {
        const a = simp(n.a);
        if (pure(a)){ const r = FUNCS[n.f](a.v); if (Number.isInteger(r)) return N(r) }
        if (n.f === 'ln' && isNum(a) && a.sym === 'e') return N(1);
        return fn(n.f, a);
      }
      case 'pow': {
        const a = simp(n.a), b = simp(n.b);
        if (pure(b) && b.v === 0) return N(1);
        if (pure(b) && b.v === 1) return a;
        if (pure(a) && pure(b)) return N(Math.pow(a.v, b.v));
        if (a.k === 'pow' && pure(a.b) && pure(b)) return simp(pow(a.a, N(a.b.v * b.v)));
        return pow(a, b);
      }
      case 'bin': {
        const a = simp(n.a), b = simp(n.b);
        const pa = pure(a), pb = pure(b);
        if (n.o === '+'){
          if (pa && a.v === 0) return b; if (pb && b.v === 0) return a; if (pa && pb) return N(a.v + b.v);
          if (b.k === 'neg') return simp(sub(a, b.a));
          if (pb && b.v < 0) return sub(a, N(-b.v));
          if (pa && !pb) return add(b, a);
          return add(a, b);
        }
        if (n.o === '-'){
          if (pb && b.v === 0) return a; if (pa && a.v === 0) return simp({k:'neg', a:b}); if (pa && pb) return N(a.v - b.v);
          if (b.k === 'neg') return add(a, b.a);
          if (same(a, b)) return N(0);
          return sub(a, b);
        }
        if (n.o === '*') return product(a, b);
        if (pa && a.v === 0) return N(0);
        if (pb && b.v === 1) return a;
        if (pa && pb && b.v !== 0) return N(a.v / b.v);
        if (pb && b.v !== 0) return product(N(1 / b.v), a);
        if (same(a, b)) return N(1);
        if (b.k === 'pow' && pure(b.b)) return product(a, pow(b.a, N(-b.b.v)));
        if (b.k === 'var' || b.k === 'fn') return product(a, pow(b, N(-1)));
        return div(a, b);
      }
    }
    return n;
  }
  function simplify(n){ let prev, cur = n, i = 0; do { prev = JSON.stringify(cur); cur = simp(cur) } while (JSON.stringify(cur) !== prev && ++i < 6); return cur }

  /* ---- printing ---- */
  function P(n, prec = 0){
    let s, my;
    switch (n.k){
      case 'num': {
        if (n.sym){ s = n.sym; my = 10; break }
        s = fmtNice(n.v);
        my = n.v < 0 ? 1.5 : s.includes('/') ? 2.5 : s.includes('π') && s !== 'π' ? 2.5 : 10; break;
      }
      case 'var': s = n.v; my = 10; break;
      case 'neg': s = '-' + P(n.a, 3); my = 3; break;
      case 'pct': s = P(n.a, 10) + '%'; my = 10; break;
      case 'fact': s = P(n.a, 10) + '!'; my = 10; break;
      case 'fn':
        if (n.f === 'sqrt') s = (n.a.k === 'var' || (pure(n.a) && n.a.v >= 0)) ? '√' + P(n.a) : '√(' + P(n.a) + ')';
        else if (n.f === 'abs') s = '|' + P(n.a) + '|';
        else if (n.f === 'ln' && n.a.k === 'fn' && n.a.f === 'abs') s = 'ln|' + P(n.a.a) + '|';
        else s = n.f + '(' + P(n.a) + ')';
        my = 10; break;
      case 'pow': {
        if (pure(n.b) && n.b.v < 0) return P(div(N(1), n.b.v === -1 ? n.a : pow(n.a, N(-n.b.v))), prec);
        const base = P(n.a, 9.5), e = n.b;
        s = (pure(e) && Number.isInteger(e.v) && e.v >= 0 && e.v < 100) ? base + toSup(e.v) : base + '^' + P(e, 9.5);
        my = 8; break;
      }
      case 'bin': {
        if (n.o === '+' || n.o === '-'){ s = P(n.a, 1) + (n.o === '+' ? ' + ' : ' - ') + P(n.b, n.o === '-' ? 1.5 : 1); my = 1; break }
        if (n.o === '/'){ s = P(n.a, 2) + '/' + P(n.b, 2.5); my = 2; break }
        const fs = []; (function c(x){ if (x.k === 'bin' && x.o === '*'){ c(x.a); c(x.b) } else fs.push(x) })(n);
        const top = [], den = [];
        fs.forEach(f => { if (f.k === 'pow' && pure(f.b) && f.b.v < 0) den.push(f.b.v === -1 ? f.a : pow(f.a, N(-f.b.v))); else top.push(f) });
        let coef = null;
        if (top.length && pure(top[0])) coef = top.shift().v;
        if (coef !== null && !Number.isInteger(coef)){ const fr = frac(coef); if (fr){ den.unshift(N(fr[1])); coef = fr[0] } }
        const body = top.map(f => P(f, 2.5)).join('·');
        let t = coef === null || coef === 1 ? (body || '1') : coef === -1 ? '-' + (body || '1') : fmt(coef) + (body ? (/^[\d.]/.test(body) ? '·' : '') + body : '');
        if (den.length){ const d = den.map(f => P(f, 2.5)).join('·'); s = (top.length > 1 ? '(' + t + ')' : t) + '/' + (den.length > 1 ? '(' + d + ')' : d) }
        else s = t;
        my = 2; break;
      }
    }
    return my < prec ? '(' + s + ')' : s;
  }

  /* ---- integration ---- */
  function pv(f, v){
    if (f.k === 'var' && f.v === v) return 1;
    if (f.k === 'fn' && f.f === 'sqrt'){ const i = pv(f.a, v); return i === null ? null : i / 2 }
    if (f.k === 'pow' && !hasVar(f.b, v)){ const i = pv(f.a, v); if (i === null) return null; let e; try { e = ev(f.b, {}) } catch { return null } return i * e }
    return null;
  }
  function splitConst(n, v){
    let c = 1; const fs = [];
    const walk = (x, inv) => {
      if (x.k === 'bin' && x.o === '*'){ walk(x.a, inv); walk(x.b, inv) }
      else if (x.k === 'bin' && x.o === '/'){ walk(x.a, inv); walk(x.b, !inv) }
      else if (x.k === 'neg'){ c = -c; walk(x.a, inv) }
      else if (!hasVar(x, v)){ let val; try { val = evRad(x, {}) } catch { val = NaN } c = inv ? c / val : c * val }
      else fs.push(inv ? pow(x, N(-1)) : x);
    };
    walk(n, false);
    if (!isFinite(c)) return null;
    let expo = 0; const other = [];
    fs.forEach(f => { const p = pv(f, v); if (p !== null) expo += p; else other.push(f) });
    if (!other.length) return {c, rest: pow({k:'var', v}, N(expo))};
    if (other.length === 1 && expo === 0) return {c, rest: other[0]};
    return null;
  }
  function lin(a, v){
    try { const f0 = evRad(a, {[v]:0}), f1 = evRad(a, {[v]:1}), f2 = evRad(a, {[v]:2}); if (Math.abs((f2 - f1) - (f1 - f0)) < 1e-9 && Math.abs(f1 - f0) > 1e-12) return f1 - f0 } catch {}
    return null;
  }
  function integBasic(f, v){
    const X = {k:'var', v};
    const lnAbs = a => fn('ln', fn('abs', a));
    if (f.k === 'pow' && f.a.k === 'var' && f.a.v === v && pure(f.b)){
      const n = f.b.v;
      if (n === 0) return X;
      if (Math.abs(n + 1) < 1e-12) return lnAbs(X);
      return mul(N(1 / (n + 1)), pow(X, N(n + 1)));
    }
    if (f.k === 'fn'){
      const k = lin(f.a, v); if (k === null) return null;
      const sc = x => k === 1 ? x : mul(N(1 / k), x);
      if (f.f === 'sin') return sc({k:'neg', a:fn('cos', f.a)});
      if (f.f === 'cos') return sc(fn('sin', f.a));
      if (f.f === 'exp') return sc(f);
      if (f.f === 'tan') return sc({k:'neg', a:lnAbs(fn('cos', f.a))});
      if (f.f === 'sqrt') return sc(mul(N(2/3), pow(f.a, N(1.5))));
      return null;
    }
    if (f.k === 'pow' && !hasVar(f.a, v)){
      const k = lin(f.b, v); if (k === null) return null;
      const isE = isNum(f.a) && f.a.sym === 'e';
      return div(f, isE ? N(k) : mul(N(k), fn('ln', f.a)));
    }
    if (f.k === 'pow' && pure(f.b)){
      const k = lin(f.a, v); if (k === null) return null;
      const n = f.b.v;
      if (Math.abs(n + 1) < 1e-12) return mul(N(1 / k), lnAbs(f.a));
      return mul(N(1 / (k * (n + 1))), pow(f.a, N(n + 1)));
    }
    return null;
  }
  function integ(n, v){
    if (!hasVar(n, v)) return mul(n, {k:'var', v});
    if (n.k === 'bin' && (n.o === '+' || n.o === '-')){ const a = integ(n.a, v), b = integ(n.b, v); return a && b ? {k:'bin', o:n.o, a, b} : null }
    if (n.k === 'neg'){ const a = integ(n.a, v); return a ? {k:'neg', a} : null }
    const sc = splitConst(n, v); if (!sc) return null;
    const r = integBasic(sc.rest, v);
    return r ? (sc.c === 1 ? r : mul(N(sc.c), r)) : null;
  }

  /* ---- numeric calculus ---- */
  function simpson(f, a, b, n = 2000){
    if (a === b) return 0;
    const h = (b - a) / n; let s;
    try {
      s = f(a) + f(b);
      for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    } catch { throw new MErr("The function isn't defined everywhere between those bounds") }
    const r = s * h / 3;
    if (!isFinite(r)) throw new MErr("This integral doesn't have a finite value between those bounds");
    return r;
  }
  function bound(str){
    const t = str.trim();
    if (/^[-+]?\s*(∞|inf(inity)?)$/i.test(t)) throw new MErr("Integrals with ∞ as a bound aren't supported yet");
    const v = evalNum(t); if (v === null) throw new MErr(`“${t}” isn't a number`);
    return v;
  }
  function evalNum(s){ try { const a = parseExpr(s); if (varsOf(a).size) return null; return evRad(a, {}) } catch { return null } }
  function converge(ys){
    if (ys.some(y => Number.isNaN(y))) return undefined;
    const a = ys[ys.length - 2], b = ys[ys.length - 1];
    if (Math.abs(b) > 1e6 && Math.abs(b) > Math.abs(a) * 1.5) return b > 0 ? Infinity : -Infinity;
    if (Math.abs(b - a) < 1e-4 * Math.max(1, Math.abs(b))) return b;
    return undefined;
  }
  function limit(ast, v, aStr){
    const f = x => { try { return evRad(ast, {[v]:x}) } catch { return NaN } };
    const t = aStr.trim();
    if (/^[-+]?(∞|inf(inity)?)$/i.test(t)){
      const sgn = t.startsWith('-') ? -1 : 1;
      const r = converge([1e4, 1e5, 1e6, 1e7].map(x => f(sgn * x)));
      if (Math.abs(r - Math.E) < 1e-5) return Math.E;
      if (r === undefined) throw new MErr("This limit doesn't settle on a value");
      return snap(r, 1e-5);
    }
    const a = evalNum(t); if (a === null) throw new MErr(`“${t}” isn't a number`);
    const hs = [1e-3, 1e-4, 1e-5, 1e-6];
    const l = converge(hs.map(h => f(a - h))), r = converge(hs.map(h => f(a + h)));
    if (l === undefined || r === undefined) throw new MErr("This limit doesn't settle on a value");
    if (!isFinite(l) || !isFinite(r)){ if (l === r) return l; throw new MErr("The limits from the left and right don't match, so the limit doesn't exist") }
    if (Math.abs(l - r) > 1e-3 * Math.max(1, Math.abs(l))) throw new MErr("The limits from the left and right don't match, so the limit doesn't exist");
    return snap((l + r) / 2, 1e-5);
  }

  const CALC_RE = /[∫Σ∑]|\bd(?:²|\^2)?\s*\/\s*d[a-z]|\blim\b/;
  const LEAD_RE = /^[A-Za-z ,.?!'’]*?(?=∫|Σ|∑|\bd(?:²|\^2)?\s*\/\s*d[a-z]|\blim\b)/;
  function calcSeg(raw){
    let s = raw.trim(), m;
    if (s.startsWith('∫')){
      s = s.slice(1).trim();
      let lo = null, hi = null;
      if ((m = s.match(/^\[\s*([^,\]]+?)\s*,\s*([^\]]+?)\s*\]\s*/))){ lo = m[1]; hi = m[2]; s = s.slice(m[0].length) }
      else if ((m = s.match(/^([₀₁₂₃₄₅₆₇₈₉₋]+)\s*([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)\s*/))){ lo = fromSub(m[1]); hi = fromSup(m[2]); s = s.slice(m[0].length) }
      else if ((m = s.match(/^([₀₁₂₃₄₅₆₇₈₉₋]+)\s*\^\s*\(?([^\s)]+)\)?\s*/))){ lo = fromSub(m[1]); hi = m[2]; s = s.slice(m[0].length) }
      else if ((m = s.match(/^_\s*\{?([^\s^}]+)\}?\s*\^\s*\{?([^\s}]+)\}?\s*/))){ lo = m[1]; hi = m[2]; s = s.slice(m[0].length) }
      m = s.match(/^(.*?)\s*d([a-z])\s*$/);
      if (!m || !m[1].trim()) throw new MErr('An integral needs a function and “dx” at the end, like ∫ x² dx');
      const v = m[2], body = parseExpr(m[1]);
      if (lo !== null){ const a = bound(lo), b = bound(hi); return {t:'num', v:snap(simpson(x => evRad(body, {[v]:x}), a, b)), what:'integral'} }
      let F = null; try { const r = integ(body, v); F = r ? simplify(r) : null } catch {}
      return {t:'anti', ast:body, v, F};
    }
    if ((m = s.match(/^d(²|\^2)?\s*\/\s*d([a-z])(²|\^2)?\s*(.*)$/))){
      const v = m[2]; let body = m[4], at = null;
      const am = body.match(/^(.*?)\s+at\s+([a-z])\s*=\s*(.+)$/i); if (am){ body = am[1]; at = am[3] }
      if (!body.trim()) throw new MErr('Write what to differentiate after d/dx, like d/dx (x³)');
      const ast = parseExpr(body);
      let d = simplify(D(ast, v)); if (m[1] || m[3]) d = simplify(D(d, v));
      if (at !== null){ const x = bound(at); return {t:'num', v:snap(evRad(d, {[v]:x}), 1e-9), what:'derivative'} }
      return {t:'fx', ast:d, v, what:'derivative'};
    }
    if ((m = s.match(/^lim\s*_?\s*\(?\s*([a-z])\s*(?:→|->)\s*([^\s)]+)\s*\)?\s*(.+)$/))){
      return {t:'num', v:limit(parseExpr(m[3]), m[1], m[2]), what:'limit'};
    }
    if ((m = s.match(/^[Σ∑]\s*\(\s*([a-z])\s*=\s*([^→]+?)\s*(?:→|->|to)\s*([^)]+)\)\s*(.+)$/))){
      const v = m[1], a = Math.round(bound(m[2])), b = Math.round(bound(m[3])), body = parseExpr(m[4]);
      if (b - a > 1e6) throw new MErr('That sum has too many terms to add up');
      let total = 0; for (let k = a; k <= b; k++) total += evRad(body, {[v]:k});
      return {t:'num', v:snap(total, 1e-9), what:'sum'};
    }
    return null;
  }
  function valOf(seg){
    const c = calcSeg(seg); if (c) return c;
    let rhs = seg.trim(), hasC = false;
    const cm = rhs.match(/^(.*?)\s*\+\s*[cC]\s*$/); if (cm){ rhs = cm[1]; hasC = true }
    const ast = parseExpr(rhs); const vs = [...varsOf(ast)];
    if (!vs.length) return {t:'num', v:evRad(ast, {}), hasC};
    if (vs.length === 1) return {t:'fx', ast, v:vs[0], hasC};
    throw new NotMath();
  }
  const PTS = [0.37, 0.81, 1.23, 1.77, 2.31, -0.63, 3.1];
  function sameFn(f, g, tol = 1e-6){
    let n = 0;
    for (const x of PTS){
      let a, b; try { a = f(x); b = g(x) } catch { continue }
      if (!isFinite(a) || !isFinite(b)) continue;
      n++; if (Math.abs(a - b) > tol * Math.max(1, Math.abs(a), Math.abs(b))) return false;
    }
    return n >= 3;
  }
  const asFn = val => val.t === 'num' ? () => val.v : x => evRad(val.ast, {[val.v]:x});
  function compareVals(a, b, rawB){
    if (a.t === 'anti'){
      if (b.t === 'anti') return null;
      const G = asFn(b), f = asFn({t:'fx', ast:a.ast, v:a.v});
      const dG = x => (G(x + 1e-5) - G(x - 1e-5)) / 2e-5;
      if (!sameFn(dG, f, 1e-4)) return 'wrong';
      return b.hasC ? null : 'noC';
    }
    if (a.t === 'num' && b.t === 'num') return close(a.v, b.v, rawB) ? null : 'wrong';
    return sameFn(asFn(a), asFn(b)) ? null : 'wrong';
  }
  const valText = v => v.t === 'num' ? fmtNice(v.v) : v.t === 'fx' ? P(v.ast) : v.F ? P(v.F) + ' + C' : null;
  function splitTop(s){
    const out = []; let depth = 0, cur = '';
    for (const c of s){
      if (c === '(' || c === '[') depth++;
      else if (c === ')' || c === ']') depth = Math.max(0, depth - 1);
      if (c === '=' && depth === 0 && !/\bat\s+[a-z]\s*$/i.test(cur)){ out.push(cur); cur = '' }
      else cur += c;
    }
    out.push(cur); return out;
  }

  function analyzeCalc(s, i, src){
    const form = msg => ({kind:'form', title:"It's written wrong", msg, src, line:i});
    let segs = splitTop(s).map(x => x.trim());
    const lead = segs[0].match(LEAD_RE); if (lead) segs[0] = segs[0].slice(lead[0].length).trim();
    const wants = segs.length >= 2 && segs[segs.length - 1] === '';
    if (wants) segs.pop();
    if (segs.some(x => x === '')) return form('Two “=” signs with nothing between them');
    let vals;
    try { vals = segs.map(valOf) } catch (e){ if (e instanceof NotMath) return null; if (e instanceof MErr) return form(e.message); return null }
    for (let k = 1; k < vals.length; k++){
      const r = compareVals(vals[k-1], vals[k], segs[k]);
      if (r === 'noC') return form('Add “+ C” at the end. An indefinite integral always needs a constant.');
      if (r === 'wrong'){
        const a = vals[k-1];
        let msg;
        if (a.t === 'anti') msg = `The derivative of ${segs[k]} isn't ${P(a.ast)}, so it isn't this integral.${a.F ? ` It should be ${P(a.F)} + C.` : ''}`;
        else if (a.t === 'fx') msg = `The derivative is ${P(a.ast)}, not ${segs[k]}.`;
        else msg = `${segs[k-1]} equals ${fmtNice(a.v)}, not ${segs[k]}.`;
        return {kind:'bad', title:'The answer is incorrect', msg, src, line:i, correct:valText(a)};
      }
    }
    const last = vals[vals.length - 1];
    if (wants){ const t = valText(last); return t ? {kind:'ghost', ghost:t, line:i} : null }
    if (vals.length === 1){ const t = valText(last); return t ? {kind:'ghost', ghost:'= ' + t, line:i} : null }
    return {kind:'ok', line:i};
  }

  function stripLabel(line){
    let s = line, label = false;
    s = s.replace(/^\s*(?:[-•*▪◦]\s+|\(?[a-z0-9]{1,2}[).]\s+|#+\s*|q\d+[).:]?\s*)/i, '');
    const m = s.match(/^([^=:]*[a-zA-Z]{3,}[^=:]*):\s*(.*)$/);
    if (m){ s = m[2]; label = true }
    s = s.replace(/\s*(\/\/|←|<-|#).*$/, '');
    return {s, label};
  }
  function looksMath(norm){
    if (!norm.includes('=') || !/\d/.test(norm)) return false;
    const words = norm.match(/[a-zA-Z]{2,}/g) || [];
    return words.every(w => { w = w.toLowerCase(); return FUNCS[w] || w === 'pi' || Object.keys(FUNCS).some(k => w.startsWith(k) && w.length - k.length === 1) });
  }
  function solveLinear(f){
    const xs = [1.3, 2.9, 4.7], ys = [];
    for (const x of xs){ try { ys.push(f(x)) } catch { return null } }
    const a = (ys[1] - ys[0]) / (xs[1] - xs[0]);
    if (!isFinite(a)) return null;
    const pred = ys[0] + a * (xs[2] - xs[0]);
    if (Math.abs(pred - ys[2]) > 1e-7 * Math.max(1, Math.abs(ys[2]))) return {nonlinear:true};
    if (Math.abs(a) < 1e-12) return {degenerate:true};
    return {x: xs[0] - ys[0] / a};
  }

  function analyze(text, opts = {}){
    RAD = !!opts.rad;
    const lines = text.split('\n');
    const res = new Array(lines.length).fill(null);
    let lastVal = null, chain = null;
    lines.forEach((raw, i) => {
      if (!raw.trim()){ lastVal = null; chain = null; return }
      const {s, label} = stripLabel(raw);
      if (label) chain = null;
      const src = raw.trim();
      if (CALC_RE.test(s)){ res[i] = analyzeCalc(s, i, src); lastVal = null; return }
      const norm = normalize(s);
      if (!norm.includes('=')){
        const cleaned = norm.replace(/sqrt|sin|cos|tan|log|ln|abs|exp|pi/gi, '');
        if (/\d/.test(norm) && (/[-+*/^]/.test(norm) || /^\s*-?[\d.]+\s*$/.test(norm)) && !/[a-zA-Z]/.test(cleaned)){
          try { lastVal = ev(parse(tokenize(norm))) } catch { lastVal = null }
        } else lastVal = null;
        return;
      }
      if (!looksMath(norm)){ lastVal = null; return }
      const segs = splitTop(norm).map(x => x.trim());
      const isCont = segs[0] === '' && lastVal !== null;
      const wantsAnswer = segs.length >= 2 && segs[segs.length-1] === '';
      const form = msg => { res[i] = {kind:'form', title:"It's written wrong", msg, src, line:i}; lastVal = null };
      for (let k = 0; k < segs.length; k++){
        if (segs[k] !== '') continue;
        if (k === 0 && isCont) continue;
        if (k === segs.length - 1 && wantsAnswer && k > 0 && segs[k-1] !== '') continue;
        if (k === 0){ lastVal = null; return }
        return form('Two “=” signs with nothing between them');
      }
      const asts = [];
      for (const sg of segs){
        if (sg === ''){ asts.push(null); continue }
        try { asts.push(parse(tokenize(sg))) }
        catch (e){ if (e instanceof NotMath){ lastVal = null; return } return form(e.message) }
      }
      const vars = new Set(); asts.forEach(a => varsOf(a, vars));
      if (vars.size === 0){
        let prev = isCont ? lastVal : null, prevSeg = null;
        try {
          for (let k = 0; k < asts.length; k++){
            if (!asts[k]) continue;
            const v = ev(asts[k]);
            if (Number.isNaN(v)) return form("This isn't defined, like the log of a negative number");
            if (prev !== null && !close(prev, v, segs[k])){
              const left = isCont && prevSeg === null ? 'The line above' : disp(prevSeg);
              res[i] = {kind:'bad', title:'The answer is incorrect', msg:`${left} equals ${fmt(prev)}, not ${disp(segs[k])}.`, src, line:i, correct:fmt(prev)};
              lastVal = null; return;
            }
            prev = v; prevSeg = segs[k];
          }
        } catch (e){ return form(e.message) }
        lastVal = prev;
        res[i] = wantsAnswer ? {kind:'ghost', ghost:fmt(prev), line:i} : {kind:'ok', line:i};
        return;
      }
      lastVal = null;
      if (vars.size !== 1 || wantsAnswer || segs.length !== 2 || isCont) return;
      const v = [...vars][0];
      const f = x => ev(asts[0], {[v]:x}) - ev(asts[1], {[v]:x});
      const sol = solveLinear(f);
      if (!sol || sol.nonlinear) return;
      if (sol.degenerate){
        let val; try { val = f(1) } catch { return }
        if (Math.abs(val) > 1e-9) res[i] = {kind:'bad', title:'The answer is incorrect', msg:`This can't be true for any value of ${v}. The two sides never match.`, src, line:i};
        return;
      }
      const simpleL = new RegExp(`^\\s*${v}\\s*=\\s*-?[\\d.]+\\s*$`, 'i').test(norm), simpleR = new RegExp(`^\\s*-?[\\d.]+\\s*=\\s*${v}\\s*$`, 'i').test(norm);
      const simple = simpleL || simpleR;
      if (chain && chain.v === v){
        if (!close(chain.x, sol.x)){
          res[i] = {kind:'bad', title:'The answer is incorrect', msg: simple
            ? `Line ${chain.line+1} gives ${v} = ${fmt(chain.x)}, so ${v} = ${disp(segs[simpleL ? 1 : 0])} doesn't follow. Check it by putting it back in.`
            : `This step gives ${v} = ${fmt(sol.x)}, but line ${chain.line+1} gives ${v} = ${fmt(chain.x)}. Something changed between the steps.`, src, line:i, correct:`${v} = ${fmt(chain.x)}`};
          return;
        }
        res[i] = {kind:'ok', line:i};
      } else {
        chain = {v, x:sol.x, line:i};
        if (!simple) res[i] = {kind:'solve', ghost:`${v} = ${fmt(sol.x)}`, line:i};
      }
    });
    RAD = false;
    return res;
  }

  /* ---- words to notation ---- */
  function mathify(f){
    return f.trim()
      .replace(/\bsquare root of\s+/gi, '√').replace(/\bsqrt\s*\(/gi, '√(')
      .replace(/\s*\bsquared\b/gi, '²').replace(/\s*\bcubed\b/gi, '³')
      .replace(/\bto the power of\s+(\d)\b/gi, (m, d) => SUP[d]).replace(/\btimes\b/gi, '×').replace(/\bdivided by\b/gi, '/').replace(/\bover\b/gi, '/')
      .replace(/\bpi\b/gi, 'π').replace(/\b(infinity|inf)\b/gi, '∞').replace(/->/g, '→')
      .replace(/([a-zA-Z0-9)])\^(\d)(?![\d.])/g, (m, a, d) => a + SUP[d]);
  }
  const wrap = f => /[+\-−]/.test(f.replace(/^[-−]/, '')) && !/^\(.*\)$/.test(f) ? '(' + f + ')' : f;
  function guessVar(f){ const m = f.replace(/sqrt|sin|cos|tan|log|ln|abs|exp|pi/gi, '').match(/[a-zA-Z]/); return m ? m[0].toLowerCase() : 'x' }
  function bnd(lo, hi){ lo = mathify(lo); hi = mathify(hi); return /^-?\d+$/.test(lo) && /^-?\d+$/.test(hi) ? toSub(lo) + toSup(hi) : `[${lo},${hi}]` }
  const tail = r => r ? ' ' + r.trim() : '';
  function convertWords(line){
    let m;
    if (/["“”]/.test(line)) return null;
    if ((m = line.match(/^(.*?)\b(?:the\s+)?(?:definite\s+)?integral\s+of\s+(.+?)\s+(?:d([a-z])\s+)?(?:from|between)\s+(.+?)\s+(?:to|and)\s+(.+?)\s*(=.*)?$/i))){
      const f = mathify(m[2]); return m[1] + `∫${bnd(m[4], m[5])} ${f} d${m[3] || guessVar(f)}` + tail(m[6]);
    }
    if ((m = line.match(/^(.*?)\b(?:the\s+)?(?:indefinite\s+)?(?:integral|antiderivative)\s+of\s+(.+?)(?:\s+d([a-z]))?\s*(=.*)?$/i))){
      const f = mathify(m[2]); return m[1] + `∫ ${f} d${m[3] || guessVar(f)}` + tail(m[4]);
    }
    if ((m = line.match(/^(.*?)\b(?:the\s+)?(second\s+)?derivative\s+of\s+(.+?)(?:\s+(?:with respect to|wrt)\s+([a-z]))?(?:\s+(?:at|when)\s+([a-z])\s*=\s*([^=]+?))?\s*(=.*)?$/i))){
      const f = mathify(m[3]); const v = (m[4] || m[5] || guessVar(f)).toLowerCase();
      return m[1] + (m[2] ? `d²/d${v}² ` : `d/d${v} `) + wrap(f) + (m[6] ? ` at ${v}=${mathify(m[6])}` : '') + tail(m[7]);
    }
    if ((m = line.match(/^(.*?)\b(?:the\s+)?limit\s+of\s+(.+?)\s+as\s+([a-z])\s+(?:approaches|goes to|tends to|->|→)\s+(.+?)\s*(=.*)?$/i))){
      return m[1] + `lim ${m[3]}→${mathify(m[4])} ${wrap(mathify(m[2]))}` + tail(m[5]);
    }
    if ((m = line.match(/^(.*?)\b(?:the\s+)?sum\s+of\s+(.+?)\s+(?:for|from)\s+([a-z])\s*(?:=|from)\s*(.+?)\s+to\s+(.+?)\s*(=.*)?$/i))){
      return m[1] + `Σ(${m[3]}=${mathify(m[4])}→${mathify(m[5])}) ${mathify(m[2])}` + tail(m[6]);
    }
    const t = line.replace(/\blim\s*([a-z])\s*->\s*/gi, 'lim $1→').replace(/\bd\/d([a-z])\s+([^=]*?)\^(\d)/g, (mm, v, a, d) => `d/d${v} ${a}${SUP[d]}`);
    return t !== line ? t : null;
  }
  const WORD_RE = /\b(integral|antiderivative|derivative|limit of|sum of)\b|\blim\s*[a-z]\s*->/i;

  function evaluate(str){ try { const a = parseExpr(str); if (varsOf(a).size) return null; return ev(a) } catch { return null } }
  return {analyze, fmt, fmtNice, evaluate, close, disp, normalize, convertWords, WORD_RE, toSup, toSub};
})();
