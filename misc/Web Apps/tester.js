document.create
const template = ` <div class="middle" id="background-mask"></div>
<div class="middle center" id="container">
    <h1 id="title">Tester</h1>
    <h3 id="subtitle">Never Lose track of your ideas</h3>
      <p class="para">Keep track of your tasks and ideas with Tester, a brand new todo-list application</p>
    <div id="buttons-wrapper">
        <button class="btn-signin button" id="signin">Sign Up</button>
        <button class="btn-login button" id="login">Log In</button>
    </div>
</div>`
document.getElementById('template').innerHTML = template

const btnSignin = document.getElementById('signin')
const btnLogin = document.getElementById('login')
const body = document.getElementsByTagName('BODY')[0]
const storage = window.localStorage
let nmrDataObjects
const currentUserData = {}
let lists = []
let nmrUntitledLists = 0
let oldTitleOnEdit

const createPopup = (width = 400, height = 500, backcolor = 'white') => {
  const mask = document.createElement('div')
  mask.className = 'middle popup-mask'
  mask.id = 'mask'
  body.appendChild(mask)

  const window = document.createElement('div')
  window.className = 'middle'
  window.id = 'popup'
  window.style.backgroundColor = backcolor
  window.style.width = width + 'px'
  window.style.height = height + 'px'
  window.style.position = 'fixed'
  body.appendChild(window)

  body.style.overflow = 'hidden'

  return window
}

const leavePopup = (e) => {
  if (e.target.classList.contains('popup-mask')) {
    removePopup()
  }
}

const createTextInputBlock = (text, type, mandatory, placeholder, classes) => {
  const wrapper = document.createElement('div')
  wrapper.style.margin = '12px 0'
  wrapper.style.display = 'grid'

  const label = document.createElement('label')
  label.innerHTML = mandatory ? text + "<span style='color: red;'>*</span>" : text
  const input = document.createElement('input')
  input.type = type
  input.name = type
  if (placeholder) { input.placeholder = placeholder }

  if (classes) { input.className = classes }

  wrapper.appendChild(label)
  wrapper.appendChild(input)

  return wrapper
}

const createCheckboxInputBlock = (type, placeholder, classes) => {
  const wrapper = document.createElement('div')

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.name = 'checkbox'
  const input = document.createElement('input')
  input.type = type
  input.name = type
  if (placeholder) { input.placeholder = placeholder }

  if (classes) { input.className = classes }

  wrapper.appendChild(checkbox)
  wrapper.appendChild(input)

  return wrapper
}

const createSubmitButton = (text, form, classes) => {
  const wrapper = document.createElement('div')
  const button = document.createElement('button')
  button.innerText = text
  button.type = 'submit'
  button.value = 'submit'
  button.form = form
  if (classes) { button.className = classes }

  wrapper.appendChild(button)

  return wrapper
}

// FORMS DATA
let loginData
let signinData

// clicking out of the popup
document.addEventListener('click', leavePopup)

const signinProcess = (e) => {
  const popup = createPopup(450, 500)

  const container = document.createElement('div')
  container.style.position = 'relative'
  container.id = 'form-cont'

  const form = document.createElement('form')
  form.action = '#'
  form.id = 'signinform'
  form.className = 'middle form-container'

  const title = document.createElement('h3')
  title.className = 'form-title'
  title.innerText = 'Create an account!'

  const credentials = document.createElement('div')
  credentials.className = 'credentials-wrapper'
  credentials.id = 'credentials'

  credentials.appendChild(createTextInputBlock('First Name: ', 'text', true, 'your first name here...'))
  credentials.appendChild(createTextInputBlock('Last Name: ', 'text', true, 'your last name here...'))
  credentials.appendChild(createTextInputBlock('Email: ', 'email', true, 'example@example.com'))
  credentials.appendChild(createTextInputBlock('Password: ', 'password', true, 'your password here...'))

  const touWrapper = document.createElement('div')
  touWrapper.className = 'tof-wrapper'
  touWrapper.style.paddingTop = '15px'
  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.name = 'tou'
  const touLabel = document.createElement('label')
  touLabel.className = 'tou-label'
  touLabel.innerHTML = "I agree to the <a href='#'>Terms of Use</a>."
  touWrapper.appendChild(checkbox)
  touWrapper.appendChild(touLabel)
  credentials.appendChild(touWrapper)

  credentials.appendChild(createSubmitButton('Sign in', 'signinform', 'btn-submit btn-signin button'))

  form.appendChild(title)
  form.appendChild(credentials)

  container.appendChild(form)

  popup.appendChild(container)
}

const loginProcess = (e) => {
  const popup = createPopup(450, 480)

  const container = document.createElement('div')
  container.style.position = 'relative'
  container.id = 'form-cont'

  const form = document.createElement('form')
  form.action = '#'
  form.id = 'loginform'
  form.className = 'middle form-container'

  const title = document.createElement('h3')
  title.className = 'form-title'
  title.innerText = 'Log in to your account!'

  const credentials = document.createElement('div')
  credentials.className = 'credentials-wrapper'
  credentials.id = 'credentials'

  credentials.appendChild(createTextInputBlock('Email: ', 'email', true, 'example@example.com'))
  credentials.appendChild(createTextInputBlock('Password: ', 'password', true, 'your password here...'))
  credentials.appendChild(createSubmitButton('Login', 'loginform', 'btn-submit btn-login button'))

  form.appendChild(title)
  form.appendChild(credentials)

  container.appendChild(form)

  popup.appendChild(container)
}

// buttons click event
btnSignin.addEventListener('click', signinProcess)
btnLogin.addEventListener('click', loginProcess)

const container = document.getElementById('container')

const setupPageLogedIn = () => {
  removePopup()

  // main page
  body.removeChild(document.getElementById('background-image'))

  const removeSquareBrackets = (string) => {
    let newS = ''
    let current
    for (let i = 0; i < string.length; i++) {
      current = string.charAt(i)
      if (current !== '[' && current !== ']') {
        newS += current
      }
    }
    return newS
  }

  let infoObject, data, currentLists, info
  let listWithItemsInfo
  if (data === storage.getItem(currentUserData.email)) {
    lists = []
    currentLists = data.split('},{')
    for (const list of currentLists) {
      listWithItemsInfo = []
      infoObject = {}
      for (const i of removeExtraCharsFromJSONstringify(list).split(',')) {
        info = removeSquareBrackets(i)
        info = info.split(':')
        const info0 = info[0]
        const info1 = info[1]
        if (info0 === 'title' || info0 === 'date' || info0 === 'nElems') {
          if (info0 === 'title') {
            if (info1.split(' ')[0] === 'Untitled') { nmrUntitledLists = parseInt(info1.split(' ')[1]) + 1 }
            infoObject.title = info1
          } else if (info0 === 'date') {
            infoObject.date = info1
          } else if (info0 === 'nElems') {
            infoObject.nElems = info1
          }
        } else {
          if (info0 === 'items') {
            listWithItemsInfo.push(info1)
          } else {
            listWithItemsInfo.push(info0)
          }
        }
      }

      const tmpArray = []
      for (let i = 0; i < listWithItemsInfo.length; i += 2) {
        tmpArray.push([listWithItemsInfo[i], listWithItemsInfo[i + 1]])
      }
      infoObject.items = tmpArray
      lists.push(infoObject)
    }
  }

  setupDashBoard()
}

const alertMessage = (text, color) => {
  const wrapper = document.createElement('div')
  wrapper.style.marginTop = '-30px'
  wrapper.id = 'error-msg'

  const msg = document.createElement('p')
  msg.style.color = color
  msg.innerText = text

  wrapper.appendChild(msg)

  return wrapper
}

const retreiveData = (e) => {
  let dataList, vals, dataObject, userData, params, storedUserInputs, filteredUserData, param, i
  if (e.target.value === 'submit') {
    e.preventDefault()
    const formElem = e.target.parentNode.parentNode.parentNode
    let errorMsg
    if ((errorMsg = document.getElementById('error-msg'))) { formElem.removeChild(errorMsg) }
    switch (formElem.id.split('form')[0]) {
      case 'signin':
        signinData = new FormData(document.getElementById('signinform'))
        dataList = []
        if (signinData.has('tou')) {
          for (vals of signinData) {
            if (vals[1]) { dataList.push(vals) }
          }
          if (dataList.length === 5) {
            let emailExists = false
            for (i = 0; i < nmrDataObjects; i++) {
              userData = storage.getItem('user' + i)
              params = userData.split(',')
              storedUserInputs = []
              for (param of params) {
                filteredUserData = param.split(':')
                storedUserInputs.push(removeExtraCharsFromJSONstringify(filteredUserData[1]))
              }

              // if the email from the current input is the same as an email from storage
              if (dataList[2][1] === storedUserInputs[2]) { emailExists = true }
            }
            if (!emailExists) {
              dataObject = {
                firstName: dataList[0][1],
                lastName: dataList[1][1],
                email: dataList[2][1],
                pass: dataList[3][1]
              }
              currentUserData.firstName = dataObject.firstName
              currentUserData.lastName = dataObject.lastName
              currentUserData.email = dataObject.email
              currentUserData.pass = dataObject.pass
              storage.setItem('user' + nmrDataObjects, JSON.stringify(dataObject))
              storage.setItem('nmrDataObjects', ++nmrDataObjects)

              setupPageLogedIn()
            } else {
              formElem.insertBefore(alertMessage('There is already an account registered with that email!', 'red'), document.getElementById('credentials'))
            }
          } else {
            formElem.insertBefore(alertMessage('You have to fill in all mandatory fields marked with *', 'red'), document.getElementById('credentials'))
          }
        } else {
          formElem.insertBefore(alertMessage('You need to agree to the Terms of Use!', 'red'), document.getElementById('credentials'))
        }
        break
      case 'login':
        loginData = new FormData(document.getElementById('loginform'))
        dataList = []
        for (vals of loginData) {
          if (vals[1]) { dataList.push(vals) }
        }
        if (dataList.length === 2) {
          dataObject = {
            email: dataList[0][1],
            pass: dataList[1][1]
          }
          let foundEmail = false
          let correctPass = false
          for (i = 0; i < nmrDataObjects; i++) {
            userData = storage.getItem('user' + i)
            params = userData.split(',')
            storedUserInputs = []
            for (param of params) {
              filteredUserData = param.split(':')
              storedUserInputs.push(removeExtraCharsFromJSONstringify(filteredUserData[1]))
            }

            if (dataObject.email === storedUserInputs[2]) {
              foundEmail = true
              if (dataObject.pass === storedUserInputs[3]) {
                correctPass = true
                currentUserData.firstName = storedUserInputs[0]
                currentUserData.lastName = storedUserInputs[1]
                currentUserData.email = storedUserInputs[2]
                currentUserData.pass = storedUserInputs[3]

                setupPageLogedIn()

                return
              }
            }
          }
          if (!foundEmail) {
            formElem.insertBefore(alertMessage('There is no account with that email!', 'red'), document.getElementById('credentials'))
          } else if (!correctPass) {
            formElem.insertBefore(alertMessage('Wrong password!', 'red'), document.getElementById('credentials'))
          }
        } else {
          formElem.insertBefore(alertMessage('You have to fill in all mandatory fields marked with *', 'red'), document.getElementById('credentials'))
        }
        break
    }
  }
}

function removeExtraCharsFromJSONstringify (s) {
  if (s) {
    let newString = ''
    for (let i = 0; i < s.length; i++) {
      const c = s.charAt(i)
      if (c !== '"' && c !== '{' && c !== '}') { newString += c }
    }
    return newString
  }
  return s
}

document.getElementById('buttons-wrapper').addEventListener('click', (e) => {
  if (e.target.classList.contains('button')) {
    const formContainer = document.getElementById('form-cont')
    formContainer.addEventListener('click', retreiveData)
  }
})

const setup = () => {
  if (!storage.getItem('nmrDataObjects')) {
    storage.setItem('nmrDataObjects', '0')
  }
  nmrDataObjects = parseInt(storage.getItem('nmrDataObjects'))
}

const createListContainer = (date, title, nmrItems) => {
  const wrapper = document.createElement('div')
  wrapper.className = 'list-container-wrapper'

  const listContainer = document.createElement('ul')
  listContainer.className = 'list-container'
  listContainer.style.pointerEvents = 'none'

  const l1 = document.createElement('li')
  l1.className = 'list-date'
  l1.innerText = date
  const l2 = document.createElement('li')
  l2.className = 'list-title'
  l2.innerText = title
  const l3 = document.createElement('li')
  l3.className = 'list-nmr-items'
  l3.innerText = nmrItems

  wrapper.appendChild(listContainer)
  listContainer.appendChild(l1)
  listContainer.appendChild(l2)
  listContainer.appendChild(l3)

  return wrapper
}

const setupDashBoard = () => {
  const dashbContainer = document.createElement('div')
  dashbContainer.id = 'dashb-container'
  body.appendChild(dashbContainer)

  // Navbar
  const navbWrapper = document.createElement('div')
  navbWrapper.id = 'dashb-navbar-wrapper'
  const navbar = document.createElement('ul')
  navbar.id = 'dashb-navbar'
  const l0 = document.createElement('li')
  l0.innerText = 'Hello, ' + currentUserData.firstName + '!'
  l0.style.cursor = 'default'
  const l1 = document.createElement('li')
  l1.innerText = 'Account Settings'
  l1.id = 'settings'
  const l2 = document.createElement('li')
  l2.innerText = 'Logout'
  l2.id = 'logout'

  dashbContainer.appendChild(navbWrapper)
  navbWrapper.appendChild(navbar)
  navbar.appendChild(l0)
  navbar.appendChild(l1)
  navbar.appendChild(l2)

  // Lists
  const listsContainer = document.createElement('div')
  listsContainer.id = 'lists-container'
  dashbContainer.appendChild(listsContainer)

  // if (listsInfo.length === 0) {
  if (lists.length === 0 || (lists.length === 1 && !lists[0].title)) {
    const msg = document.createElement('h3')
    msg.innerText = "You don't have any lists yet!"
    msg.id = 'no-lists-msg'

    const plusContainer = document.createElement('div')
    plusContainer.id = 'add-lists-sign-cont-noLists'
    const plus = document.createElement('span')
    plus.className = 'add-lists-sign'
    plus.innerText = '+'
    plusContainer.appendChild(plus)

    listsContainer.appendChild(msg)
    listsContainer.appendChild(plusContainer)
  } else {
    const plusContainer = document.createElement('div')
    plusContainer.id = 'add-lists-sign-cont'
    const plus = document.createElement('span')
    plus.className = 'add-lists-sign'
    plus.innerText = '+'
    plusContainer.appendChild(plus)

    listsContainer.appendChild(plusContainer)
    // for (let list of listsInfo) {
    for (const list of lists) {
      if (list.title) { listsContainer.appendChild(createListContainer(list.date, list.title, list.nElems)) }
    }
  }
}

window.onscroll = (e) => {
  let navbar
  if (navbar === document.getElementById('dashb-navbar-wrapper')) {
    if (document.documentElement.scrollTop > 25) {
      navbar.style.boxShadow = '0px 1px 6px black'
      navbar.style.opacity = '0.9'
    } else {
      navbar.style.boxShadow = 'none'
      navbar.style.opacity = '1'
    }
  }
}

const createItem = (text, lastItem, checked = false) => {
  const itemWrapper = document.createElement('div')
  itemWrapper.style.display = 'flex'

  const checkbox = createCheckboxInputBlock('text', 'item, plan, etc...')
  checkbox.children[1].style.width = '275px'
  if (text) { checkbox.children[1].value = text }
  if (checked) { checkbox.children[0].checked = true }

  itemWrapper.appendChild(checkbox)

  if (lastItem) {
    const plus = document.createElement('span')
    plus.innerText = '+'
    plus.id = 'add-new-item-sign'
    itemWrapper.appendChild(plus)
  }

  return itemWrapper
}

const plusButtonAction = (e) => {
  if (e.target.classList.contains('add-lists-sign')) {
    const savedTarget = e.target

    const popup = createPopup(500, 700)
    popup.style.top = '70px'

    const container = document.createElement('div')

    const form = document.createElement('form')
    form.className = 'middle form-container'
    form.id = 'new-list-form'
    form.action = '#'

    const itemsLabel = document.createElement('label')
    itemsLabel.innerHTML = "Items: <span style='color: red;'>*</span>"
    itemsLabel.style.fontSize = '20px'
    itemsLabel.style.fontWeight = 'bold'

    const titleLabel = createTextInputBlock('Title: ', 'title', false, 'Untitled ' + nmrUntitledLists)
    titleLabel.style.display = 'inline-block'
    titleLabel.style.marginBottom = '50px'
    form.appendChild(titleLabel)

    const itemsContainer = document.createElement('div')
    itemsContainer.id = 'items-container'
    itemsContainer.appendChild(itemsLabel)

    popup.appendChild(container)
    container.appendChild(form)

    itemsContainer.appendChild(createItem(false, true))

    form.appendChild(itemsContainer)

    form.appendChild(createSubmitButton('Create', 'new-list-form', 'btn-submit button btn-default'))

    popup.addEventListener('click', (e2) => {
      if (e2.target.id === 'add-new-item-sign') {
        itemsContainer.children[itemsContainer.children.length - 1].removeChild(document.getElementById('add-new-item-sign'))
        itemsContainer.appendChild(createItem(false, true))
      } else if (e2.target.classList.contains('button')) {
        e2.preventDefault()
        const listData = new FormData(document.getElementById('new-list-form'))
        const dataList = []
        for (vals of listData) {
          if (vals[1]) { dataList.push(vals) }
        }
        if ((dataList.length === 1 && dataList[0][0] === 'text') || dataList.length > 1) {
          const dataObject = {}
          if (dataList[0][0] !== 'title') {
            dataObject.title = 'Untitled ' + (nmrUntitledLists++)
          } else {
            dataObject.title = dataList[0][1]
          }

          let titleExists = false
          for (const l of lists) {
            if (dataObject.title === l.title) {
              titleExists = true
            }
          }

          if (!titleExists) {
            sendListToStorage(dataList, dataObject)

            removePopup()
          } else {
            window.alert('There is a list with that same name already!')
          }
        } else {
          window.alert('You have to add something to your list!')
        }
      }
    })
  }
}

const listContainerAction = (e) => {
  const target = e.target
  if (target.classList.contains('list-container-wrapper')) {
    const popup = createPopup(500, 700)
    popup.style.top = '70px'

    const container = document.createElement('div')

    const form = document.createElement('form')
    form.className = 'middle form-container'
    form.id = 'new-list-form'
    form.action = '#'

    const itemsLabel = document.createElement('label')
    itemsLabel.innerHTML = "Items: <span style='color: red;'>*</span>"
    itemsLabel.style.fontSize = '20px'
    itemsLabel.style.fontWeight = 'bold'

    const itemsContainer = document.createElement('div')
    itemsContainer.id = 'items-container'
    itemsContainer.appendChild(itemsLabel)

    popup.appendChild(container)
    container.appendChild(form)

    for (const list of lists) {
      const items = list.items
      const title = list.title

      oldTitleOnEdit = target.children[0].children[1].innerText
      if (oldTitleOnEdit === title) {
        const titleLabel = createTextInputBlock('Title: ', 'title', false, 'Untitled ' + nmrUntitledLists)
        titleLabel.style.display = 'inline-block'
        titleLabel.style.marginBottom = '50px'
        titleLabel.children[1].value = title
        form.appendChild(titleLabel)
        let c = 0
        let plusValue = false
        for (const item of items) {
          if (c === items.length - 1) {
            plusValue = true
          }
          c++
          if (item[1] === 'true') { itemsContainer.appendChild(createItem(item[0], plusValue, true)) } else if (item[1] === 'false') { itemsContainer.appendChild(createItem(item[0], plusValue, false)) } else if (item[1]) { itemsContainer.appendChild(createItem(item[0], plusValue, true)) } else { itemsContainer.appendChild(createItem(item[0], plusValue, false)) }
        }
      }
    }

    form.appendChild(itemsContainer)

    form.appendChild(createSubmitButton('Delete', 'new-list-form', 'btn-submit button btn-delete'))
    form.appendChild(createSubmitButton('Edit', 'new-list-form', 'btn-submit button btn-default'))

    popup.addEventListener('click', (e2) => {
      if (e2.target.id === 'add-new-item-sign') {
        itemsContainer.children[itemsContainer.children.length - 1].removeChild(document.getElementById('add-new-item-sign'))
        itemsContainer.appendChild(createItem(false, true))
      } else if (e2.target.classList.contains('btn-default')) {
        e2.preventDefault()
        const listData = new FormData(document.getElementById('new-list-form'))
        const dataList = []
        for (vals of listData) {
          if (vals[1]) { dataList.push(vals) }
        }
        if ((dataList.length === 1 && dataList[0][0] === 'text') || dataList.length > 1) {
          const dataObject = {}
          if (dataList[0][0] !== 'title') {
            dataObject.title = 'Untitled ' + (nmrUntitledLists++)
          } else {
            dataObject.title = dataList[0][1]
          }

          lists = listRemove(oldTitleOnEdit)
          document.getElementById('lists-container').removeChild(target)

          sendListToStorage(dataList, dataObject)

          removePopup()
        } else {
          window.alert('You have to add something to your list!')
        }
      } else if (e2.target.classList.contains('btn-delete')) {
        e2.preventDefault()
        const titleToRemove = target.children[0].children[1].innerText
        if (confirm('Are you sure you want to remove ' + titleToRemove + '?')) {
          if (titleToRemove.split(' ')[0] === 'Untitled' && titleToRemove.split(' ')[1] === '' + (nmrUntitledLists - 1)) { nmrUntitledLists-- }
          lists = listRemove(titleToRemove)
          document.getElementById('lists-container').removeChild(target)

          storage.setItem(currentUserData.email, JSON.stringify(lists))

          removePopup()
        }
      }
    })
  }
}

function listRemove (title) {
  const newList = []
  for (const l of lists) {
    if (l.title !== title) {
      newList.push(l)
    }
  }
  return newList
}

function sendListToStorage (list, dataObject) {
  dataObject.items = []
  let countItems = 0
  for (let i = 0; i < list.length; i++) {
    const pushIntoObject = () => {
      if (list[i - 1][0] === 'checkbox') {
        dataObject.items.push([list[i][1], true])
      } else {
        dataObject.items.push([list[i][1], false])
      }
    }

    if (list[0][0] === 'title') {
      if (list[i][0] === 'text') {
        countItems++
        pushIntoObject()
      }
    } else if (list[0][0] === 'text') {
      if (i === 0) {
        countItems++
        dataObject.items.push([list[i][1], false])
      } else {
        if (list[i][0] === 'text') {
          countItems++
          pushIntoObject()
        }
      }
    }
  }
  const today = new Date()
  const date = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate()
  dataObject.date = date
  dataObject.nElems = countItems

  const listsContainer = document.getElementById('lists-container')
  listsContainer.appendChild(createListContainer(date, dataObject.title, countItems))

  if (listsContainer.children[0].id === 'no-lists-msg') {
    listsContainer.removeChild(listsContainer.children[1])
    listsContainer.removeChild(listsContainer.children[0])
  }

  const plusContainer = document.createElement('div')
  plusContainer.id = 'add-lists-sign-cont'
  const plus = document.createElement('span')
  plus.className = 'add-lists-sign'
  plus.innerText = '+'
  plusContainer.appendChild(plus)

  listsContainer.appendChild(plusContainer)

  lists.push(dataObject)

  storage.setItem(currentUserData.email, JSON.stringify(lists))
}

function removePopup () {
  // remove popup and mask
  body.removeChild(body.children[3])
  body.removeChild(body.children[2])
  body.style.overflowY = 'auto'
}

const settingsAction = (e) => {
  if (e.target.id === 'settings') {
    const popup = createPopup()

    const form = document.createElement('form')
    form.id = 'settingsform'
    form.action = '#'
    form.className = 'middle form-container'
    popup.appendChild(form)

    const titleWrapper = document.createElement('div')
    titleWrapper.style.marginBottom = '60px'
    const title = document.createElement('label')
    title.innerText = 'Account Settings'
    title.style.fontSize = '24px'
    titleWrapper.appendChild(title)
    form.appendChild(titleWrapper)

    const seetingTitleWrapper = document.createElement('div')
    seetingTitleWrapper.id = 'setting-title'
    seetingTitleWrapper.style.marginBottom = '30px'
    const seetingTitle = document.createElement('label')
    seetingTitle.style.fontSize = '22px'
    seetingTitle.innerText = 'Change Password'
    seetingTitleWrapper.appendChild(seetingTitle)
    form.appendChild(seetingTitleWrapper)

    form.appendChild(createTextInputBlock('Old Password: ', 'password', true, 'your old password here...'))
    form.appendChild(createTextInputBlock('New Password: ', 'password', true, 'your new password here...'))
    form.appendChild(createTextInputBlock('New Password (again): ', 'password', true, 'your new password here...'))
    form.appendChild(createSubmitButton('Change', 'settingsform', 'btn-submit button btn-default'))

    popup.addEventListener('click', (e2) => {
      if (e2.target.classList.contains('btn-default')) {
        e2.preventDefault()
        let errorMsg
        if ((errorMsg = document.getElementById('error-msg'))) { form.removeChild(errorMsg) }

        const listData = new FormData(document.getElementById('settingsform'))
        const dataList = []
        for (vals of listData) {
          if (vals[1]) { dataList.push(vals) }
        }

        if (dataList.length === 3) {
          if (dataList[0][1] === currentUserData.pass) {
            if (dataList[1][1] === dataList[2][1]) {
              for (let i = 0; i < nmrDataObjects; i++) {
                const storageVals = removeExtraCharsFromJSONstringify(storage.getItem('user' + i))
                if (storageVals.split(',')[2].split(':')[1] === currentUserData.email) {
                  storage.removeItem('user' + i)
                  currentUserData.pass = dataList[1][1]
                  storage.setItem('user' + i, JSON.stringify(currentUserData))
                  const msg = alertMessage('Password changed successfully!', 'green')
                  msg.children[0].style.color = 'green !important'
                  form.insertBefore(msg, document.getElementById('setting-title'))
                }
              }
            } else {
              form.insertBefore(alertMessage('The new password is not the same when typed again!', 'red'), document.getElementById('setting-title'))
            }
          } else {
            form.insertBefore(alertMessage('The old password is not correct!', 'red'), document.getElementById('setting-title'))
          }
        } else {
          form.insertBefore(alertMessage('You have to fill in all mandatory fields marked with *', 'red'), document.getElementById('setting-title'))
        }
      }
    })
  } else if (e.target.id === 'logout') {
    body.removeChild(document.getElementById('dashb-container'))

    // retrieve signin/login page
    const back = document.createElement('div')
    back.id = 'background-image'
    body.appendChild(back)

    const mask = document.createElement('div')
    mask.className = 'middle'
    mask.id = 'background-mask'
    back.appendChild(mask)

    const mid = document.createElement('div')
    mid.className = 'middle center'
    mid.id = 'container'
    back.appendChild(mid)

    const title = document.createElement('h1')
    title.id = 'title'
    title.innerText = 'To-do List'
    mid.appendChild(title)

    const subtitle = document.createElement('h3')
    subtitle.id = 'subtitle'
    subtitle.innerText = 'Keep track of what you have to-do!'
    mid.appendChild(subtitle)

    const btnWrapper = document.createElement('div')
    btnWrapper.id = 'buttons-wrapper'
    mid.appendChild(btnWrapper)

    const btnSignin = document.createElement('button')
    btnSignin.className = 'btn-signin button'
    btnSignin.id = 'signin'
    btnSignin.innerText = 'Sign Up'
    btnWrapper.appendChild(btnSignin)

    const separator = document.createElement('div')
    btnWrapper.appendChild(separator)

    const btnLogin = document.createElement('button')
    btnLogin.className = 'btn-login button'
    btnLogin.id = 'login'
    btnLogin.innerText = 'Log In'
    btnWrapper.appendChild(btnLogin)

    // buttons click event
    btnSignin.addEventListener('click', signinProcess)
    btnLogin.addEventListener('click', loginProcess)

    document.getElementById('buttons-wrapper').addEventListener('click', (e) => {
      if (e.target.classList.contains('button')) {
        const formContainer = document.getElementById('form-cont')
        formContainer.addEventListener('click', retreiveData)
      }
    })
  }
}

document.addEventListener('click', (e) => {
  plusButtonAction(e)
  listContainerAction(e)
  settingsAction(e)
})
