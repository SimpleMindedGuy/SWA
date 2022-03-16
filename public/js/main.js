let files=[];
const list=[];
// let img=0;

document.documentElement.querySelectorAll(`.editable-ordered-list-container`).forEach((container)=>{

    const UnDragCont = typeof container.parentElement.parentElement.querySelector(".ordered-list-container") != 'undefined' ? container.parentElement.parentElement.querySelector(".ordered-list-container") : undefined

    

    container.addEventListener("dragover",(e)=>{
        e.preventDefault();
        const drag = container.querySelector(".dragging");
        if(drag != undefined){
            const afterElement = getDragAfterEelement(container,e.clientY).element;
            if(afterElement == null)
            {
                container.appendChild(drag)
            }
            else
            {
                container.insertBefore(drag,afterElement);
            }
            const children = [...container.querySelectorAll(".editable-ordered-list-element")]
            children.forEach((element,index)=>{
                element.querySelector(`.list-element-edit`).querySelector("p").innerHTML = `${index+UnDragCont.children.length}`
                element.querySelector(`.list-element-edit`).querySelector(`input`).value = index + UnDragCont.children.length
                element.querySelector(`.list-element-edit`).querySelector(`input`).checked = true
                console.log(element.querySelector(`input`).value)
                console.log("list")
                console.log(list)
            })
        }
        checkMSGs()
    })
})

document.documentElement.querySelectorAll(`.editable-ordered-list-element`).forEach(async(draggable) => {
    let beforedrag=[];
    

    await draggable.addEventListener("dragstart",(e)=>{
        draggable.classList.add("dragging")
        beforedrag = draggable.parentElement.querySelectorAll('input[type="checkbox"]')
        checkMSGs()
        console.log("list")
        console.log(list)
    })
    
    await draggable.addEventListener("dragend",(e)=>{
        draggable.classList.remove("dragging")
        draggable.parentElement.querySelectorAll('input[type="checkbox"]').forEach((element,index) => {
            if(element !=  beforedrag[index]){
                draggable.parentElement.parentElement.querySelector("#reset").checked=true;
            }
        });
        checkMSGs()
        console.log("list")
        console.log(list)
    })

    list.push(draggable)
})

async function resetEditableList()
{
    document.documentElement.querySelector(`.editable-ordered-list-container`).innerHTML =""
    list.forEach(element => {
        document.documentElement.querySelector(`.editable-ordered-list-container`).appendChild(element)
        console.log(element)
    });

    const container = document.documentElement.querySelector(`.editable-ordered-list-container`)
    const UnDragCont = typeof container.parentElement.parentElement.querySelector(".ordered-list-container") != 'undefined' ? container.parentElement.parentElement.querySelector(".ordered-list-container") : undefined

    const children = [...container.querySelectorAll(".editable-ordered-list-element")]
    children.forEach((element,index)=>{
        element.querySelector(`.list-element-edit`).querySelector("p").innerHTML = `${index+UnDragCont.children.length}`
        element.querySelector(`.list-element-edit`).querySelector(`input`).value = index + UnDragCont.children.length
        element.querySelector(`.list-element-edit`).querySelector(`input`).checked = true
    })
}

window.addEventListener("dragover",function(e)
{
    e = e || event;
    e.preventDefault();
    window.addEventListener("drop",function(e)
    {
        e = e || event;
        e.preventDefault();
    });

});

function ChangeTheme(Switch)
{
    if (Switch.checked) 
    {
        document.documentElement.setAttribute('dark','false');
        localStorage.setItem('Theme','light')
    }
    else
    {
        document.documentElement.setAttribute('dark','true');
        localStorage.setItem('Theme','dark')
    }
}

document.documentElement.querySelectorAll(`[type="file"]`).forEach(input => {
    input.value =""
    // console.log(input.files)
})


async function ShowHidePermissions()
{
    // console.log("check")
    document.documentElement.querySelector(`#permissions`).checked = true;
}

async function ShowHideUserGroups()
{
    // console.log("check")
    let checkboxes = document.documentElement.querySelectorAll(`input[name="Users"]`);
    let hide =true;
    console.log(document.documentElement.querySelector("#permissions"));
    for(let i = 0 ; i < checkboxes.length ;i++){
    
        if(checkboxes[i].checked == true)
        {
            hide = false;
            break
        }
    }
    if(hide == true)
    {
        document.documentElement.querySelector(".right-slide-tile").classList.remove("active");
        
    }
    else
    {
        document.documentElement.querySelector(`.right-slide-tile`).classList.add("active");
    }
    checkMSGs()

}


async function showSubmitButton()
{
    // console.log("check")
    let checkboxes = [...document.documentElement.querySelectorAll(`input[name="Users"]`)];
    for (let ele of [...document.documentElement.querySelectorAll(`input[name="Groups"]`)]){
        await checkboxes.push(ele)
    }
    
    let show =false;

    for(let i = 0 ; i < checkboxes.length ;i++){
    
        if(checkboxes[i].checked == true)
        {
            show = true;
            break
        }
    }
    if(show == true)
    {
        document.documentElement.querySelector(`input[id="reset"]`).checked = true;
    }
    else
    {
        document.documentElement.querySelector(`input[id="reset"]`).checked = false;
    }
    checkMSGs()

}

async function uncheckUserAndGroups()
{
    let checkboxes = [...document.documentElement.querySelectorAll(`input[name="Users"]`)];
    for (let ele of [...document.documentElement.querySelectorAll(`input[name="Groups"]`)]){
        await checkboxes.push(ele)
    }


    for(const cb of checkboxes){
        cb.checked = false;
    }
    checkMSGs()

}


async function ClearRadioSelection(){
    for( const Radio of document.documentElement.querySelectorAll("[name='groups']"))
    {
        Radio.checked=false;
    }
    // document.documentElement.querySelectorAll("[name='groups']")
}


function getDragAfterEelement(container , y)
{
    let elements = [...container.querySelectorAll('.editable-ordered-list-element:not(.dragging)')]

    return elements.reduce((closest,child)=>{
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if(offset < 0 && offset > closest.offset)
        {
            return({offset:offset,element : child})
        }
        else
        {
            return closest
        }
    },{offset: Number.NEGATIVE_INFINITY})
}


function ReadInputFiles(input)
{
    files=[...input.files]
    console.log(files)
}

function InputFiles(input)
{
    let dropzone =input.parentElement.querySelector(".dropzone")
    
    let newfiles = [...input.files]

    console.log(newfiles)

    let target = newfiles.length + files.length

    newfiles.forEach((file)=> 
    {
        if(file.type.indexOf("image") != -1)
        {
            // files.push(file);
            // console.log(file)
            ShowDropedFile(dropzone,file,target,input)
        }
        
    })


    // console.log(target)

    // SaveFilesDATA(dropzone , input , "add", target);
    
}

function DropFile(element , event)
{


    let dropzone = element.parentElement.parentElement.querySelector(".dropzone");
    let input =dropzone.parentElement.querySelector(`[type="file"]`);
    dropzone.classList.remove("drag");

    files=[...input.files]
    // console.log(input);

    // console.log(files)
    let newfiles = [...event.dataTransfer.files];

    let target = newfiles.length + files.length
    
    newfiles.forEach((file)=> 
    {
        if(file.type.indexOf("image") != -1)
        {
            // files.push(file);
            ShowDropedFile(dropzone,file,target,input)
        }
        
    })


}

function SaveFilesDATA(dropzone ,input , type , target)
{
    let FileData = new ClipboardEvent("").clipboardData || new DataTransfer();
    // console.log(files.length)
    console.log(target)
    console.log(files.length)
    console.log(files.length == target)

    if(type == "Add" && files.length === target)
    {
        files.forEach(file => {
            FileData.items.add(file);
        })
    }
    else if ( type == "Remove" || type == "remove")
    {
        // files.splice(target-1,1);
        files.splice(target, 1)
        files.forEach(file => {
            FileData.items.add(file);
        })
    } else if ( type == "Set" || type == "set")
    {
        FileData.items.add(files[files.length-1])
    }

    // console.log(files)
    
    input.files= FileData.files
    console.log(input.files)
    // files =[]
    // files=[];
}


function ActiveDropZone(element)
{
    element.parentElement.parentElement.querySelector(".dropzone").classList.add("drag");
}

function DeActiveDropZone(element)
{
    element.parentElement.parentElement.querySelector(".dropzone").classList.remove("drag");
}

function ShowDropedFile(dropzone,file,target,input)

{
    dropzone.classList.add("active")
    const reader = new FileReader();
    let textarea = dropzone.parentElement.querySelector(".post-input")
    reader.readAsDataURL(file);
    if(dropzone.classList.contains("one") )
    {
        reader.onload = ()=>
        {
            dropzone.innerHTML=`
            <div class="image">
                <img src="${reader.result}" alt="">
                <div class="image-blur">
                    <div class="cover"></div>

                    <div class="upload-remove" onclick="RemoveFile(this)">
                        <div class="x-line1"></div>
                        <div class="x-line2"></div>
                    </div>


                </div>
            </div>`;
            files.push(file);
            console.log("testing ",dropzone)

            SaveFilesDATA(dropzone , input , "Set", target);
        }
        console.log(file)

    }
    else if(dropzone.classList.contains("single")){

        if(dropzone.classList.contains("removeimage"))
        {
            dropzone.parentElement.querySelector("#removeimage").checked=false;
            reader.onload = ()=>
            {
                dropzone.innerHTML=`
                <div class="image">
                    <img src="${reader.result}" alt="">
                    <div class="image-blur">
                        <div class="cover"></div>

                        <label class="upload-remove" onclick="RemoveFile(this)" for="removeimage">
                            <div class="x-line1"></div>
                            <div class="x-line2"></div>
                        </label>


                    </div>
                </div>`;
                files.push(file);
                console.log("testing ",dropzone)

                SaveFilesDATA(dropzone , input , "Set", target);
            }
        }
        else
        {
            reader.onload = ()=>
            {
                dropzone.innerHTML=`
                <div class="image">
                    <img src="${reader.result}" alt="">
                    <div class="image-blur">
                        <div class="cover"></div>

                        <div class="upload-remove" onclick="RemoveFile(this)">
                            <div class="x-line1"></div>
                            <div class="x-line2"></div>
                        </div>


                    </div>
                </div>`;
                files.push(file);
                console.log("testing ",dropzone)

                SaveFilesDATA(dropzone , input , "Set", target);
            }
        }
        
        console.log(file)
        
    }
    else if(dropzone.classList.contains("icon")){
        reader.onload = ()=>
        {
            dropzone.innerHTML=`
            <div class="image">
                <img src="${reader.result}" alt="" onclick="RemoveFile(this)">

            </div>`;
            files.push(file);
            console.log("testing ",dropzone)

            SaveFilesDATA(dropzone , input , "Set", target);
        }
        console.log(file)
    }
    else
    {
        reader.onload = ()=>
        {
            dropzone.innerHTML+=`
            <div class="image">
                <img src="${reader.result}" alt="">
                <div class="image-blur">
                    <div class="cover"></div>

                    <div class="upload-remove" onclick="RemoveFile(this)">
                        <div class="x-line1"></div>
                        <div class="x-line2"></div>
                    </div>


                </div>
            </div>`;
            files.push(file);
            // console.log(files)
            console.log("testing ",dropzone)
            SaveFilesDATA(dropzone , input , "Add", target);
            if(dropzone.classList.contains("blogs-post"))
            {
                textarea.value += `[img${dropzone.children.length}]`;
                
            }
        }

    }
}

function RemoveFile(Xbutton)
{

    setTimeout(()=>{
        let dropzone = Xbutton.parentElement.parentElement.parentElement;

        let file = Xbutton.parentElement.parentElement;
        let index = Array.prototype.indexOf.call(dropzone.children, file) + 1;
        let textarea = typeof dropzone.parentElement.querySelector(".post-input") != 'undefined' ? dropzone.parentElement.querySelector(".post-input") : undefined ;

        console.log(dropzone)
        if(dropzone.classList.contains("dropzone"))
        {
            console.log("contains")
        }
        else
        {
            console.log("does not contain")
            dropzone = dropzone.querySelector(".dropzone")
        }

        console.log(`this is file ///////////`)
        if(file.classList.contains("image"))
        {
            console.log("files")
            console.log(file)
        }
        else
        {
            console.log("files")
            file.querySelector(".image")
            console.log(file)
        }

        if(!dropzone.classList.contains("single") && !dropzone.classList.contains("one") && !dropzone.classList.contains("single") && !dropzone.classList.contains("icon") )
        {
            // console.log("removing : ",index);
            textarea.value = textarea.value.replace(`[img${index}]`, ``);
    
            for(let i = index ; i <= dropzone.children.length+1 ; i++)
            {
                textarea.value = textarea.value.replace(`[img${i}]`, `[img${i-1}]`);
            }
        }
     
        // console.log("\n \n files length : ",files.length,"files : \n",files);
        let input =dropzone.parentElement.querySelector(`[type="file"]`)
    
        if(index - (dropzone.children.length - files.length)  > 0 )
        {
            input.files = SaveFilesDATA(dropzone ,input , "remove" , index - (dropzone.children.length - files.length) -1 );
        }
        files = [...input.files]
    
        console.log( "equation  cildren - files length: ", dropzone.children.length - files.length  )
        console.log( "equation  cildren - files length - index: ", dropzone.children.length - files.length - index  )
        console.log( "equation  index - (cildren - files length)  : ", index - (dropzone.children.length - files.length)  )
        console.log( "index : " , index )
        console.log( "files" ,files )
    
    
    
        // console.log("files : ",files,"\ninput.files : ",input.files);
        file.remove();
        if (dropzone.children.length == 0)
        {
            dropzone.classList.remove("active")
            if (dropzone.classList.contains("single")) 
            {
                dropzone.innerHTML=`<label  for="${input.id}">
                <p class="note">click / drag and drop to add pictures</p>
                </label>`

                if(dropzone.classList.contains("removeimage"))
                {
                    dropzone.parentElement.querySelector("#removeimage").checked=true;
                }
            }
            if (dropzone.classList.contains("icon")) 
            {
                dropzone.innerHTML=`<label  for="${input.id}">
                    <p style="place-self : center;">Icon</p>
                </label>`
            }
        }
    }, 100);
    
}

function CloseOptionMenu(option)
{
    let menu = option.parentElement.parentElement.querySelector(".option-list")||option.parentElement.parentElement.querySelector(".edit-button");
    menu.click()
}

function ChangeOption(option)
{
    let text= option.value;
    let textbox = option.parentElement.parentElement.querySelector(".option-list").querySelector("p");
    textbox.innerHTML = text;
}


function RemoveErrorMsg(button)
{
    setTimeout(()=>{
        button.control.remove() 
        button.parentElement.remove();
        checkMSGs()
    },550)
    
}

function CheckNumberInput(input)
{
    let value = input.value;
    let num = new RegExp(/[0-9]+/gm);
    input.value = value.match(num)
    if(value.length >= 6 )
    {
        input.value = value.substring(0,6);
    }
}

function FixNumber(input)
{
    let value = input.value;
    if(value.length < 6)
    {
        for(let i=value.length; i < 6 ; i++)
        {
            value+="0"
        }
    }
    input.value = value;
}

function RemoveCharacters(text)
{
    let char = new RegExp(/[^0-9]+/g)
    text=  text.replace(char,'');
    // console.log("yes");
}

function ActiveTextarea(textarea)
{
    let TA_width = textarea.getBoundingClientRect().width
    let TA_padding = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--padding')) * 1.5;
    let FontSize=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--p-size'));
    let RowSize= Math.floor(((TA_width - TA_padding)/FontSize)*1.6)-1;
    let maxrows =0;
    if (textarea.classList.contains("post-input"))
    {
        maxrows = 4;
    }
    console.log(maxrows);
    let newrow = new RegExp(`(?<![a-z A-Z \D \d].{${RowSize}})\n.{1}|[a-z A-Z \D \d].{${RowSize}}|\n`,`g`)
    let rows = 0;
    if(textarea.value.match(newrow))
    {
        rows = textarea.value.match(newrow).length;    
    }

    if(rows > maxrows )
    {
        textarea.classList.add("active")
    }
    else
    {
        textarea.classList.remove("active")
    }
}
