import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page, request }) => {
  await request.post('http://127.0.0.1:54321/__test/reset')
  const profiles = new Map<string, object>()
  await page.route('**/api/v1/**', async route => {
    const req = route.request(), auth = req.headers().authorization
    const claims = auth ? JSON.parse(Buffer.from(auth.split('.')[1], 'base64url').toString()) : null
    if (new URL(req.url()).pathname === '/api/v1/me/profile' && claims) {
      if (req.method() === 'POST') {
        const data = req.postDataJSON()
        profiles.set(claims.sub, { id: claims.sub, username: data.username, displayName: data.displayName, bio: null, avatarUrl: null, coverUrl: null, website: null, location: null, createdAt: '2026-11-21T00:00:00Z', phoneNumber: null, birthDate: null, role: 'MEMBER' })
      }
      const body = profiles.get(claims.sub)
      return route.fulfill({ status: body ? 200 : 404, json: body || { code: 'PROFILE_NOT_FOUND' } })
    }
    return route.fulfill({ status: 404, json: { code: 'NOT_FOUND' } })
  })
})
test('validation keeps input, labels and keyboard focus at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/auth/register')
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click()
  await expect(page.getByLabel('Tên người dùng', { exact: true })).toBeFocused()
  await page.getByLabel('Tên người dùng', { exact: true }).fill('invalid name')
  await page.getByLabel('Tên hiển thị', { exact: true }).fill('Tên còn giữ')
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click()
  await expect(page.getByLabel('Tên hiển thị', { exact: true })).toHaveValue('Tên còn giữ')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/auth-mobile.png', fullPage: true })
  for (const width of [768,1024,1440]) {
    await page.setViewportSize({width,height:900});await page.goto('/auth/login')
    await expect(page.getByRole('heading',{name:'Đăng nhập',exact:true})).toBeVisible()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  }
})
test('registration waits for email, PKCE confirmation creates profile and returns to original query', async ({ page, request }) => {
  await page.goto('/auth/register?returnTo=%2Fprofile%3Fsource%3Dmap')
  await page.getByLabel('Tên người dùng', { exact: true }).fill('new_fixture')
  await page.getByLabel('Tên hiển thị', { exact: true }).fill('Tài khoản mới')
  await page.getByLabel('Email', { exact: true }).fill('new@example.test')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('fixture-new-password')
  await page.getByLabel('Nhập lại mật khẩu', { exact: true }).fill('fixture-new-password')
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Bạn chưa đăng nhập')
  expect(await page.evaluate(() => localStorage.getItem('vietnam-tourism-auth-v1'))).toBeNull()
  const mailbox = await (await request.get('http://127.0.0.1:54321/__test/mailbox?email=new@example.test')).json()
  await page.goto(`/auth/callback?code=${mailbox[0].code}&next=%2Fprofile%3Fsource%3Dmap`)
  await expect(page).toHaveURL(/\/profile\?source=map$/)
  await expect(page.getByRole('heading', { name: 'Tài khoản mới', exact: true })).toBeVisible()
})
test('wrong password preserves fields, login/logout and second account show the right profile', async ({ page }) => {
  await page.goto('/profile?source=map&page=2')
  await expect(page).toHaveURL(/\/auth\/login/)
  await page.getByLabel('Email', { exact: true }).fill('a@example.test')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('không đúng')
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('a@example.test')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('fixture-password-A')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).toHaveURL(/\/profile\?source=map&page=2$/)
  await expect(page.getByRole('heading', { name: 'Tài khoản A', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Đăng nhập', exact: true })).toBeVisible()
  await page.getByLabel('Email', { exact: true }).fill('b@example.test')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('fixture-password-B')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Tài khoản B', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Tài khoản A', exact: true })).not.toBeVisible()
})
test('recovery waits for an explicit confirmation and uses PKCE to reset the password', async ({ browser, page, request }) => {
  await page.goto('/auth/forgot-password')
  await page.getByLabel('Email', { exact: true }).fill('a@example.test')
  await page.getByRole('button', { name: 'Quên mật khẩu', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Yêu cầu đã được tiếp nhận')
  const mailbox = await (await request.get('http://127.0.0.1:54321/__test/mailbox?email=a@example.test')).json()
  const callback = new URL('/auth/callback', page.url())
  callback.searchParams.set('next', '/auth/reset-password')
  const verification = new URL('http://127.0.0.1:54321/auth/v1/verify')
  verification.search = new URLSearchParams({ token: 'fixture-recovery-link', type: 'recovery', redirect_to: callback.href }).toString()
  const emailLink = new URL('/auth/callback', page.url())
  emailLink.searchParams.set('confirmation_url', verification.href)

  let verificationRequests = 0
  await page.route(verification.href, async route => {
    verificationRequests++
    callback.searchParams.set('code', mailbox[0].code)
    await route.fulfill({ status: 303, headers: { location: callback.href } })
  })

  const otherBrowser = await browser.newPage()
  try {
    await otherBrowser.goto(emailLink.href)
    await expect(otherBrowser.getByRole('alert')).toContainText('trình duyệt đã yêu cầu email')
    await expect(otherBrowser.getByRole('button', { name: 'Tiếp tục đặt lại mật khẩu' })).toHaveCount(0)
  } finally {
    await otherBrowser.close()
  }

  await page.goto(emailLink.href)
  const continueReset = page.getByRole('button', { name: 'Tiếp tục đặt lại mật khẩu', exact: true })
  await expect(continueReset).toBeVisible()
  await page.reload()
  await expect(continueReset).toBeVisible()
  expect(verificationRequests).toBe(0)
  await continueReset.click()
  await page.getByLabel('Mật khẩu', { exact: true }).fill('fixture-updated-password')
  await page.getByLabel('Nhập lại mật khẩu', { exact: true }).fill('fixture-updated-password')
  await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click()
  await expect(page).toHaveURL(/\/auth\/login\?reset=success$/)
  await expect(page.getByRole('status')).toContainText('Đã đổi mật khẩu')
  expect(verificationRequests).toBe(1)
  expect(await page.evaluate(() => localStorage.getItem('vietnam-tourism-auth-v1'))).toBeNull()
})
test('username conflict leads to profile completion instead of a fake login success', async ({page,request})=>{
  await page.route('**/api/v1/me/profile',route=>{
    if(route.request().method()==='POST'&&route.request().postDataJSON().username==='taken_fixture')return route.fulfill({status:409,json:{code:'USERNAME_TAKEN',message:'Tên người dùng đã được sử dụng.'}})
    return route.fallback()
  })
  await page.goto('/auth/register')
  await page.getByLabel('Tên người dùng',{exact:true}).fill('taken_fixture')
  await page.getByLabel('Tên hiển thị',{exact:true}).fill('Hồ sơ mới')
  await page.getByLabel('Email',{exact:true}).fill('conflict@example.test')
  await page.getByLabel('Mật khẩu',{exact:true}).fill('fixture-password')
  await page.getByLabel('Nhập lại mật khẩu',{exact:true}).fill('fixture-password')
  await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click()
  await expect(page.getByRole('status')).toContainText('Bạn chưa đăng nhập')
  const codes=await(await request.get('http://127.0.0.1:54321/__test/mailbox?email=conflict@example.test')).json()
  await page.goto(`/auth/callback?code=${codes[0].code}`)
  await expect(page.getByRole('heading',{name:'Hoàn tất hồ sơ',exact:true})).toBeVisible()
  await page.getByLabel('Tên người dùng',{exact:true}).fill('available_fixture')
  await page.getByLabel('Tên hiển thị',{exact:true}).fill('Hồ sơ đã lưu')
  await page.getByRole('button',{name:'Hoàn tất hồ sơ',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Hồ sơ đã lưu',exact:true})).toBeVisible()
})
